#!/usr/bin/env bash
#
# Stops this project's dev and preview servers.
#
# Written against ports rather than a command-line pattern on purpose. The
# obvious `pkill -f "vite preview"` silently matches nothing: the real argv
# reads `node .../vite.js preview`, so those two words are never adjacent, and
# every "restart" left the previous server alive holding a module graph and a
# watcher over the whole project. Ports are what servers actually contend for,
# and `ss` reports who holds one as fact rather than as a guess about how a
# process spelled its own name.
#
# It refuses to kill a process that does not belong to this project. Freeing a
# port is not worth taking down a colleague process — or another checkout — that
# happened to get there first; that one gets named so a human can decide.
#
# Exits 0 whether or not anything was running, so it is safe to chain.

set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
PORTS=(5173 4173)
stopped=0
foreign=0

holders() {
  # Field 7 of ss carries users:(("name",pid=N,fd=M)); pull every pid out of it.
  ss -lptnH "sport = :$1" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u
}

belongs_to_project() {
  local cwd
  cwd="$(readlink -f "/proc/$1/cwd" 2>/dev/null)" || return 1
  [ "$cwd" = "$PROJECT_ROOT" ]
}

for port in "${PORTS[@]}"; do
  pids="$(holders "$port")"

  if [ -z "$pids" ]; then
    echo "port ${port}: free"
    continue
  fi

  for pid in $pids; do
    rss_kb="$(ps -p "$pid" -o rss= 2>/dev/null | tr -d ' ')"
    rss_kb="${rss_kb:-0}"

    if belongs_to_project "$pid"; then
      printf 'port %s: stopping pid %s (%s MB)\n' "$port" "$pid" "$((rss_kb / 1024))"
      kill "$pid" 2>/dev/null || true
      stopped=1
    else
      foreign=1
      printf 'port %s: held by pid %s from %s — left alone\n' \
        "$port" "$pid" "$(readlink -f "/proc/$pid/cwd" 2>/dev/null || echo 'an unknown directory')"
    fi
  done
done

# Give them a moment to release the listener, then insist — but only on ours.
if [ "$stopped" -eq 1 ]; then
  sleep 1
  for port in "${PORTS[@]}"; do
    for pid in $(holders "$port"); do
      if belongs_to_project "$pid"; then
        echo "port ${port}: pid ${pid} ignored SIGTERM, sending SIGKILL"
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
  done
fi

# The port pass covers the two ports the config pins. A server started with an
# explicit --port escapes it, and those are exactly the ones nobody remembers
# starting, so sweep by working directory too: any Vite belonging to this
# checkout, whatever port it chose.
#
# Identify them by argv[1], not by process name or a loose pattern. `pgrep -f
# vite` matches every process whose command line merely mentions the word —
# including the shell running this script, which is how an earlier version of
# this sweep killed its own caller. `pgrep -x node` fails the other way: these
# processes report their name as "node-MainThread", so it matched nothing at
# all. The script Node was told to run is the one unambiguous signal.
for proc in /proc/[0-9]*; do
  pid="${proc#/proc/}"
  [ "$pid" = "$$" ] && continue
  [ "$pid" = "$PPID" ] && continue

  # Processes come and go while this loop runs; a pid that exited between the
  # glob and this read is normal, not an error worth printing.
  [ -r "$proc/cmdline" ] || continue

  # argv[1] is the second NUL-separated field: the script node was handed.
  entry="$( (tr '\0' '\n' < "$proc/cmdline") 2>/dev/null | sed -n 2p)"
  case "$entry" in
    */vite/bin/vite.js) ;;
    *) continue ;;
  esac

  belongs_to_project "$pid" || continue
  kill -0 "$pid" 2>/dev/null || continue

  rss_kb="$(ps -p "$pid" -o rss= 2>/dev/null | tr -d ' ')"
  printf 'stray: stopping pid %s on an unconfigured port (%s MB)\n' \
    "$pid" "$(( ${rss_kb:-0} / 1024 ))"
  kill "$pid" 2>/dev/null || true
  stopped=1
done

if [ "$stopped" -eq 0 ] && [ "$foreign" -eq 0 ]; then
  echo "nothing of ours to stop"
fi

exit 0
