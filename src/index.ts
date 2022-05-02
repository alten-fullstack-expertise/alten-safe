export interface ISafe<T> {
    result: T | null;
    error: Error | null;
}
type Safe = <T>(promise: Promise<T>, typeCheck?: (obj: any) => boolean) => Promise<ISafe<T>>;
type IsType = <T>(obj: any, typeCheck: (obj: any) => boolean) => ISafe<T>;

/**
 * A wrapper for executing promises.
 * It wraps the promise response in an object that holds the response and an error.
 * Depending on if the request goes correctly, the result or error will be filled.
 * You can pass a generic with the function to specify the type of the result.
 * If you wish to perform a type check, you may pass a secondary argument to the function which holds a type check function.
 * 
 * @param promise - Promise, the promise that is going to be executed.
 * @param typeCheck (obj: any) => boolean, Optional, a function that can be performed on the response from a promise, to check if it is of the correct type.
 * @returns obj: { result: T | null, error: Error | null }
 */
export const safe: Safe = async <T>(promise: Promise<T>, typeCheck?: (obj: any) => boolean): Promise<ISafe<T>> => {
    try {
        const result = await promise; 

        if (!typeCheck) return { result, error: null }

        const typeCheckResult = isType<T>(result, typeCheck);

        if (!typeCheckResult.result || typeCheckResult.error) {
            throw typeCheckResult.error;
        }

        return { result: typeCheckResult.result, error: null };
    }
    catch (e: any) {
        return { result: null, error: e }
    }
}

/**
 * A function that allows you to check if an object is of a certain type in a single line.
 * Pass the object you wish to check, and the function you use for checking.
 * Returns the check result in an easy to use object.
 * 
 * @param obj - any, an object that you wish to check the type of.
 * @param typeCheck (obj: any) => boolean, the function that checks if the passed object is of a given type.
 * @returns obj: { result: T | null, error: Error | null }
 */
export const isType: IsType = <T>(obj: any, typeCheck: (obj: any) => boolean): ISafe<T> => {
    if (typeCheck(obj)) return { result: obj, error: null };
    return { result: null, error: new Error("Given object did not pass type check.") };
}