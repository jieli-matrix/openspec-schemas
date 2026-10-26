# Design

## Module boundaries

**Net complexity:** <!-- modules, dependencies, and concepts added; what is removed -->

### <!-- `PublicApi` (public, new or existing): the API the acceptance tests call -->

- **Usage:** <!-- setup, focal, and observation calls the scenarios make, naming each focal call's criterion -->
- **Hides:** <!-- knowledge or decisions callers no longer need -->
- **Abstraction:** <!-- the one concept the interface presents -->
- **Specifics:** <!-- details kept out, and the layer that owns them -->

### <!-- `Boundary` (internal, new or existing): only if its design decisions matter -->

- **Usage:** <!-- caller-side code -->
- **Hides:** <!-- knowledge or decisions callers no longer need -->
- **Abstraction:** <!-- the one concept the interface presents -->
- **Specifics:** <!-- details kept out, and the layer that owns them -->

## Test boundaries

<!-- The test level for each criterion (public function, CLI, HTTP, UI) and why. -->

## Decisions

<!-- Non-obvious choices with the alternatives considered; include migration if relevant. Omit if none. -->

## Risks / Trade-offs

<!-- [Risk] → Mitigation, including what the acceptance tests cannot catch. -->
