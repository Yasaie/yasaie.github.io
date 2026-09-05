# yasaie.com

[![Deploy](https://github.com/Yasaie/yasaie.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/Yasaie/yasaie.github.io/actions/workflows/deploy.yml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-4c9a2a)](https://github.com/Yasaie/yasaie.github.io/actions/workflows/ci.yml)
[![Licence](https://img.shields.io/badge/licence-all%20rights%20reserved-8a867d)](LICENSE)

My personal site, built as a small operating system. It boots, mounts a disk, and gives you a
shell. Everything it can tell you about me is a file on that disk.

**[yasaie.com](https://yasaie.com)**. Type `help`, or press tab.

## The disk is real

The site's content is not compiled into the JavaScript bundle. It is a directory of ordinary
documents that Vite serves verbatim, so the deployed URL space *is* the machine's filesystem:

```sh
curl https://yasaie.com/home/payam/eindhoven/whoami.txt
curl https://yasaie.com/etc/issue
```

Those are the same bytes the terminal prints, at the same paths it reports. The running program
holds no copy of them; it mounts the volume over HTTP at boot and reads it from memory after that.

## Layout

```
disk/            the documents the machine serves, at the paths it reports them at
build/           the Vite plugin that publishes the volume index
src/kernel/      finds the installed programs, parses a line, runs one
src/fs/          mounts the disk and resolves paths against it
src/tty/         what a terminal prints: lines, colours, alignment
src/session/     the pure reducer that is a running session
src/apps/        one folder per command, each an independent program
src/lib/         pure helpers that know nothing about this machine
src/hooks/       the React edge: timers, the mount, the pointer, the canvas
src/ui/          the React surface
src/styles/      the theme tokens and the handful of resets under them
tests/helpers/   scaffolding that exists only so the tests can run the real machine
tests/conventions/  tests that enforce the layout above
```

Two rules hold the shape. Everything outside `src/hooks` and `src/ui` is framework-free, which the
test runner enforces by running those layers in Node with no DOM. And a command is installed by
existing: the kernel discovers `src/apps/*` at load, so adding one is adding a folder and deleting
one is deleting a folder. No app imports another, and no app's name appears anywhere outside it.

## Running it

```sh
pnpm install
pnpm dev
pnpm check     # lint, dead code, types, tests with coverage, tests in a browser, build
```

Node 24 and pnpm 11, both pinned. `pnpm check` is what CI runs. Coverage is gated at 100% of
statements, branches, functions and lines, so the build fails before it drops; every run posts
the table to its job summary, and to the pull request when there is one.

The suite runs in three places, because the three parts of the machine answer to different
things. `machine` runs the kernel, the filesystem and every program in Node with no DOM, which
is what keeps those layers framework-free. `screen` runs the React surface in jsdom. `browser`
runs a handful of tests in real Chromium, where a stylesheet, a hovered link and a canvas
behave the way they will for a visitor. Those files are named `*.browser.test.tsx`, and they
need `pnpm exec playwright install chromium` once.

## Licence

None. This is published to be read, not reused: see [LICENSE](LICENSE). The documents under
`disk/` are my CV.
