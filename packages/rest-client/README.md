# Ares

HTTP client for calling REST APIs and seamlessly integrating Internet Identity with them.

**NOTE: This is an Experimental version**

## How to use

### Basic usage

```typescript
const response = await ares<TestResponse>({
  url: `${process.env.NEXT_PUBLIC_API_REST_URL}/test`,
  method: "POST",
  data: {
    message: "Hello, World!",
  },
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Direct access to a method

```typescript
const response = await ares.post<TestResponse>(
  `${process.env.NEXT_PUBLIC_API_REST_URL}/test`,
  {
    message: "Hello, World!",
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);
```

### Create an instance

```typescript
const instance = ares.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_REST_URL}`,
});

const response = await instance.post<TestResponse>(
  "/test",
  {
    message: "Hello, World!",
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);
```

## Know Issues

- multipart/form-data is not supported
