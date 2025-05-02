```mermaid
---
title: Passthru API architecture
---
flowchart TD
  User[User agent]
  IdBroker[OCIO-SSO]
  RevProxy[OCIO-APS]
  PassApi[Passthru API<br/>Extra authorization]
  AntiVirus[Antivirus scanner]
  IntBroker[WebMethods Integration Broker]

  User --> |Authenticate with PKCE| IdBroker
  User --> |Request with access token| RevProxy
  RevProxy <-- Introspect access token -->  IdBroker
  RevProxy -- Forward request<br/>(see Requests section) --> Container

  subgraph Container["MCS-Silver"]
    direction TB
    PassApi <--> AntiVirus
  end

  PassApi ----> |Forward request| IntBroker
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
