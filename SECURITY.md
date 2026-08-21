# Security policy

## Reporting a vulnerability

Please report security issues privately to **david@invisionsolutions.co.uk**
rather than opening a public GitHub issue, so the problem can be fixed before
it is described publicly.

A useful report includes what you found, the steps to reproduce it, and what an
attacker could achieve with it. If you have a suggested fix, that is welcome
but not expected.

You can expect an acknowledgement within a few days. I will tell you whether
the issue is accepted, and once it is resolved I am happy to credit you unless
you would rather stay anonymous.

This is a personal project maintained by one person, so please treat these as
best efforts rather than a commercial support commitment.

## Scope

In scope:

- the deployed site at https://www.payreckon.co.uk
- anything in this repository, including the calculation engine and the
  tooling in `scripts/`

Out of scope:

- vulnerabilities in Vercel, Web3Forms, or any other third party platform,
  which should go to those vendors directly
- automated scanner output with no demonstrated impact
- missing headers or configuration that carry no exploitable consequence

Please do not run denial of service or automated load testing against the live
site.

## A note on the Web3Forms access key

The feedback form's access key is a publishable value. It is prefixed
`NEXT_PUBLIC_`, it is compiled into the client bundle by design, and it is
therefore visible to anyone viewing source. That is how Web3Forms works and is
not a vulnerability on its own. Submissions are restricted to this site's
domain in the Web3Forms dashboard.

If you find a way to abuse it despite that restriction, that is very much in
scope and worth reporting.

## Reporting an incorrect tax figure

A wrong number is not a security issue, but it is the thing I most want to hear
about. Use the [feedback form](https://www.payreckon.co.uk/feedback), and
include the inputs you used and the figure you expected.
