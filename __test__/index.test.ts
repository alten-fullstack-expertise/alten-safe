import 'isomorphic-fetch';
import { isType, safe } from "../src/index";

export interface Todo {
    id: number;
    userId: number;
    title: string;
    completed: boolean;       
}

function isATodo(obj: any): obj is Todo {
    return 'id' in obj && 
            'title' in obj &&
            'completed' in obj &&
            'userId' in obj &&
            typeof obj.id === "number" &&
            typeof obj.title === "string";
}

function TodoBadCheck(obj: any): obj is Todo {
    return 'id' in obj && 'message' in obj;
}

const typeCheckErrorMessage = "Given object did not pass type check.";

test("Should see that object is a Todo", () => {
    const todo = {id: 1, title: "Test todo function", completed: false, userId: 2};
    const { result, error } = isType<Todo>(todo, isATodo);

    expect(result.id).toBe(1);
    expect(error).toBe(null);
});

test("Should see that object is Not a Todo", () => {
    const todo = {id: 1, title: 25, completed: true, userId: 1};
    const { result, error } = isType<Todo>(todo, isATodo);

    expect(result).toBe(null);
    expect(error.message).toBe(typeCheckErrorMessage);
});

test("It should execute a promise, and fill the result. Excluding type check.", async () => {
    const { result, error } = await safe<Response>(fetch('https://jsonplaceholder.typicode.com/todos/1'));
    
    expect(error).toBe(null);

    const todoResult = await safe<Todo>(result.json());

    expect(todoResult.result.id).toBe(1);
    expect(todoResult.error).toBe(null)
});

test("It should execute a promise, and fill the result. Including type check.", async () => {
    const { result, error } = await safe<Response>(fetch('https://jsonplaceholder.typicode.com/todos/1'));
    
    expect(error).toBe(null);

    const todoResult = await safe<Todo>(result.json(), isATodo);

    expect(todoResult.result.id).toBe(1);
    expect(todoResult.error).toBe(null)
});

test("It should execute a promise, and fill the error. it fails because of a 404", async () => {
    const { result, error } = await safe<Response>(fetch('https://does-not-exist-dwadwad-dwadwa-dwad.com/todos/1'));
    
    expect(result).toBe(null);
    expect(error.code).toBe('ENOTFOUND');
});

test("It should execute a promise, and fill the error. it fails because of the type check", async () => {
    const { result, error } = await safe<Response>(fetch('https://jsonplaceholder.typicode.com/todos/1'));
    
    expect(error).toBe(null);

    const todoResult = await safe<Todo>(result.json(), TodoBadCheck);

    expect(todoResult.result).toBe(null);
    expect(todoResult.error.message).toBe(typeCheckErrorMessage);
});


