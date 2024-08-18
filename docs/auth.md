# Authentication

This documentation page outlines the authentication module for the Project Manager backend. It details the process of user authentication, including implementation, configuration, and usage.

All authentication endpoints are prefixed with `/auth`.

**Request Body:** The request payload should be a **JSON** object.

**Content Type:** Ensure that the request's content type is **application/json**.

## Authentication Guarded Endpoints

Any endpoint that requires authentication will contain an `Authorization` header
with a value of `Bearer <JWT_TOKEN>`.

- **401 Unauthorized:**

Indicates that the **Authorization** header is missing or invalid.

## Register User

To register a new user, send a `POST` request to the `/register` endpoint.

### Required Fields

Include the following fields in the request body:

- **username:** The desired username for the new user.
  - Must be between 3 and 20 characters.
- **email:** The user's email address.
  - Must be a valid email format.
  - Must be between 6 and 50 characters.
- **password:** The user's password.
  - Must be at least 8 characters long.

### Response Codes

The server's response status code will indicate whether the request was successful or if an error occurred.

- **201 Created:**

Indicates that the user was successfully registered.

```json
{
  "userId": "...<USER_ID>..."
}
```

- **400 Bad Request:**

Indicates that the request was invalid. The response's `error` field will provide more details.

Possible errors include:

- `email already exists`
- `invalid create user payload`

If the error is related to an invalid body/payload, the response will also include a `validations` field describing the issues with the submitted data.

Example `curl` command:

```sh
curl localhost:5000/auth/register -XPOST -H "Content-Type: application/json" -d '{ "email": "this is an invalid email", "password": "1234" }' | jq
```

Example payload:

```json
{
  "email": "this is an invalid email",
  "password": "1234"
}
```

A `400 Bad Request` response might look like this:

```json
{
  "error": "invalid create user payload",
  "validations": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["username"],
      "message": "Required"
    },
    {
      "validation": "email",
      "code": "invalid_string",
      "message": "Invalid email",
      "path": ["email"]
    },
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 8 character(s)",
      "path": ["password"]
    }
  ]
}
```

- **500 Internal Server Error:**

Indicates that the server encountered an issue while attempting to create the user. No action is required on your part; try again later.

## Login User

To login and get JWT token, send a `GET` request to the `/login` endpoint.

### Required Fields

Include the following fields in the request body:

- **email:** The user's email address.
  - Must be a valid email format.
  - Must be between 6 and 50 characters.
- **password:** The user's password.
  - Must be at least 8 characters long.

### Response Codes

-- **200 OK:**

Indicates that email and password were successfully verified and the JWT token was returned.

```json
{
  "userId": "...<USER_ID>..."
}
```

- **400 Bad Request:**

Indicates that the request has invalid body/payload.

the response will also include a `validations` field describing the issues with the submitted data.

It should be the same as the **register** endpoint example.

- **401 Unauthorized**

Indicates that the email or password is incorrect.

- **500 Internal Server Error:**

Indicates that the server encountered an issue while attempting to create the user. No action is required on your part; try again later.

## User Metadata

To get the current logged in user's metadata, send a `GET` request to the `/me` endpoint.

- **200 OK:**

Indicates that the request was successful.

Example:

```sh
curl localhost:5000/auth/me -H "Authorization: Bearer <JWT_TOKEN>" | jq
```

Response:

```json
{
  "id": "<MongoDB ID>",
  "username": "johndoe",
  "email": "johndoe@me.com"
}
```
