```mermaid
---
title: Passthru API architecture
---
flowchart TD
    User[User agent] --> |Authenticate with PKCE| Keycloak
    User --> |Request with access token| Kong
    Kong <-- Introspect access token -->  Keycloak
    Kong -- Forward request<br/>(see Requests section) --> Pass[Passthru API<br/>Extra authorization]
    Pass <--> |Scan file uploads| ClamAV
    Pass --> |Forward request| Webm[WebMethods]
```

## Requests

Forwarded requests:

| INT | Description |
|-|-|
| 620b | Get caseload |
| 621b | Get entity details |
| 622 | Submit safety assessment |
| 678 | Get notes |
| 679c | Submit notes |
| 680 | Submit attachment |
