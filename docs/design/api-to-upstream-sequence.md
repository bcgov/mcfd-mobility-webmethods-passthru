```mermaid
---
title: WebMethods Passthru API to upstream
---
sequenceDiagram
  participant Down as Downstream<br/>(OCIO-APS)
  participant Api as Passthru API<br/>(OpenShift Silver)
  participant Clam as ClamAV
  participant Icm as ICM REST framework
  participant Webm as WebMethods<br/>Integration Broker

  Down->>Api: Forward request

  Api->>Icm: Authenticate with client credentials
  Icm->>Api: Return JWT tokens
  Api->>Icm: Check-authorization request with ID token <br/>& append username header
  Icm->>Api: Respond

  Api->>Api: Apply authorization logic
  alt Unauthorized
    rect rgba(255, 0, 0, 0.3)
      Api->>Down: Reject with HTTP 403
    end
  end

  alt is file upload request
    Api->>Clam: Send file for scanning
    Clam->>Api: Return scan result
    alt is Bad file
      rect rgba(255, 0, 0, 0.3)
        Api->>Down: Reject with HTTP:<br/>400 = infected<br/>422 = file unscannable
      end
    end
  end

  Api->>Webm: Forward request with Basic Auth <br/>& append username header
  Webm->>Api: Transform and forward response
  Api->>Down: Forward response
```

Additional information:

- [ICM REST framework](https://dev.azure.com/bc-icm/SiebelCRM%20Lab/_wiki/wikis/SiebelCRM-Lab.wiki/575/Siebel-Application-Client-ID-(Service-Account)-Operation-for-DATA-API)
