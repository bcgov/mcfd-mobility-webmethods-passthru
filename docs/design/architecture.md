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
  Icm[ICM REST framework]

  User --> |Authenticate with PKCE| IdBroker
  User --> |Request with access token| RevProxy
  RevProxy <-- Introspect access token -->  IdBroker
  RevProxy -- Forward request<br/>(see Requests section) --> Container

  subgraph Container["MCS-Silver"]
    direction TB
    PassApi <--> AntiVirus
  end

  PassApi ----> |Forward request| IntBroker
  PassApi <----> |Authorization check| Icm
```

## Requests

Forwarded requests:

| INT | Description |
|-|-|
| 620b | Get caseload |
| 621b | Get entity details |
| 622 | Submit safety assessment |
| 678 | Get notes |
| 679C | Submit notes |
| 680 | Submit attachment |

## Additional information:

- [ICM REST framework](https://dev.azure.com/bc-icm/SiebelCRM%20Lab/_wiki/wikis/SiebelCRM-Lab.wiki/575/Siebel-Application-Client-ID-(Service-Account)-Operation-for-DATA-API)
