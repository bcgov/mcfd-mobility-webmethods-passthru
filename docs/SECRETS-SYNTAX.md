# Secrets' syntax

All values unquoted unless otherwise mentioned.

## Environment secrets

### AUTH_STRING

A basic auth string in the form:

```
Basic <base 64>
```

### OPENSHIFT_NAMESPACE

OpenShift namespace in the form:

```
<licence plate>-<env>
```

### OPENSHIFT_SERVICE_ACCOUNT_TOKEN

Full JWT generated for a namespaced service account.

### WORKFLOW_API_URL

Protocol and hostname of upstream API server, e.g.

```
https://upstream.server.hostname.ca
```

## Repository secrets

### *_ENDPOINT

Path of a URL for upstream endpoints.

For the URL:

```
https://www.google.com/search?q=cats
```

Its path is:

```
/search
```

### APS_NAMESPACE

OpenShift namespace in the form:

```
<licence plate>-<env>
```

### OPENSHIFT_SERVER

Hostname and port of OpenShift cluster.

Can view URL in Dashboard using the CLI login flow.
