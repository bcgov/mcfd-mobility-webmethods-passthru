[//]: # (bc-madr v0.1)
<!-- modified MADR 4.0.0 -->

# Use API middleware in front of upstream

* status: proposed <!-- proposed | rejected | accepted | deprecated | ... | superseded by ADR-0123 -->
* date: 2025-04-29 <!-- YYYY-MM-DD when the decision was last updated -->
* decision-makers: Leo Lou (ARB), Keith Parkin (ARB), Sagar Shah, Todd Scharien, Fred Wen (ARB) <!-- list everyone involved in the decision -->
* consulted: Leo Lou (ARB), Fred Wen (ARB) <!-- list everyone whose opinions are sought (typically subject-matter experts); and with whom there is a two-way communication --> <!-- OPTIONAL -->

## Context and Problem Statement

1. The team supporting the upstream API we currently use follows Waterfall instead of Agile, so our timelines often aren't aligned.
2. The current upstream API is a low-code system, so complex requirements become an even larger endeavor than they would otherwise.
3. It is expensive to update the upstream API.

## Decision Drivers

* Enable more complex logic before forwarding to upstream (e.g. authorization, anti-virus scanning)

## Considered Options

* Write custom middleware
* Use integration software

## Decision Outcome

Chosen option: "Write custom middleware", because it best satisfies the decision drivers.

### Consequences

* Good, because we'll be able to more rapidly iterate on our middleware API, rather than waiting on a Waterfall timeline.
* Bad, because more developer effort is required within our project team, rather than relying on other teams

### Confirmation

Work with members of ARB to review designs, plans, and the actual solution after implementation to confirm the architecture is set up correctly.

## Pros and Cons of the Options

### Write custom middleware

* Good, because we have full development control of our solution
* Good, because if we use a popular API framework, developer onboarding is less effort
* Good, because any change requires a developer and for the changes to go through the typical review process
* Bad, because developer effort spent on middleware is taken away from work on other projects
  * Unless more developers are onboarded with a focus on middleware API work

### Use integration software

* Good, because less development effort is required up front
* Good, because more development effort could be spent on other projects
* Bad, because the selected software may not support plaintext version control
  * If it doesn't support plaintext version control, that means we can't use our typical Pull Request review process
* Bad, because more complex tasks depend on availability of components
* Bad, because we would need to create complex components if they don't exist (which requires developers anyway)
