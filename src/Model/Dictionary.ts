export interface Dictionary<T>
{
    [key: string]: T;
}

export interface PrimitiveDictionary extends Dictionary<string | number>
{
}