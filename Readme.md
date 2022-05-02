# Alten Safe

An NPM package which allows users to wrap their promises in a function that handles error handling, and optionally manages type checking.

## Examples

Let's start with an easy example, Simply fetching some data:
```ts
import { safe } from "alten-safe";

interface Todo {
    id: number;
    message: string;
}

const fetchSomeData = async (): Promise<Todo | undefined> => {
    const request = await safe<Todo>(axios.get("/my-todo/url/1"));
    
    if (request.error || !request.result) {
        console.log("Woops, looks like something went wrong!");
    }

    return request.result;
}
```

Destructuring the result from `safe()` may be nicer to read:
```ts
const { result, error } = await safe<Todo>(axios.get("/my-todo/url/1"));
```

#### Type checking

Let's add some type checking to our request.
For this example we'll use some of Typescripts build in typechecking features, but you can use any function that returns a boolean to indicate if an object has passed the type check or not.

```ts
import { safe } from "alten-safe";

interface Todo {
    id: number;
    message: string;
}

// Our type checking function.
const isATodo = (obj: any): obj is Todo => {
  return 'id' in obj && 'message' in obj;
}

const fetchSomeData = async (): Promise<Todo | undefined> => {
    // We pass the type checking function as the second argument.
    // If the response for our passed promise does not pass the type check,
    // the result is empty and the error is filled.
    const { result, error } = await safe<Todo>(axios.get("/my-todo/url/1"), isATodo);

    if (error) {
        console.log("Either the request came back with an error, or the response object did not pass the type check.")
        return;
    }

    return result;
}
```

It is only possible to use this package to perform a type check:

```ts
import { isType } from "alten-safe";

interface Todo {
    id: number;
    message: string;
}

// Our type checking function.
function isATodo(obj: any): obj is Todo {
  return 'id' in obj && 'message' in obj;
}

// The given object will not pass the test.
const { result, error } = isType<Todo>({id: 3, message: 27}, isATodo);
// The given object will pass the test.
const { result, error } = isType<Todo>({id: 3, message: "A real todo"}, isATodo);
```
