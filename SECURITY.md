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

- vulnerabilities in Vercel, Resend, or any other third party platform,
  which should go to those vendors directly
- automated scanner output with no demonstrated impact
- missing headers or configuration that carry no exploitable consequence

Please do not run denial of service or automated load testing against the live
site.

## A note on the feedback form

The feedback form at `/feedback` posts to this site's own `/api/feedback`
route, which sends through Resend server-side. The Resend API key is a real
secret: it is read only on the server, never carries a `NEXT_PUBLIC_` prefix,
and is scoped to sending-only access on the domain it sends from. It is not
visible from the browser by any route, and there is no equivalent of the
previous architecture's publishable key to disclose.

Submissions are validated server-side (a known feedback type, a message
length the form itself enforces), refused if they do not arrive same-origin,
checked against a honeypot field, and rate-limited per server instance. None
of that is a strong guarantee against a determined, distributed sender — say
so if you find a way past it, that is in scope and worth reporting.

**Historical note, already assessed, not something to report again.** An
earlier architecture used a publishable Web3Forms access key, compiled into
the client bundle by design. One commit in this repository's history still
contains a real one. That key is no longer in use — the form no longer talks
to Web3Forms at all — and its presence in history was assessed and accepted
as a low-severity finding at the time (it granted no account access and
carried no confidentiality loss beyond what the deployed bundle already
disclosed). It does not need reporting again.

## Reporting an incorrect tax figure

A wrong number is not a security issue, but it is the thing I most want to hear
about. Use the [feedback form](https://www.payreckon.co.uk/feedback), and
include the inputs you used and the figure you expected.
