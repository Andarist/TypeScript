// @strict: true
// @noEmit: true
// @lib: esnext

type QueryKey = readonly unknown[];

type GetQueryFnDatas<
  TQueryFnDatas extends readonly unknown[],
  TQueryKeys extends readonly QueryKey[]
> = {
  [K in keyof TQueryFnDatas]: {
    queryFn?: (key: TQueryKeys[K & keyof TQueryKeys]) => Promise<TQueryFnDatas[K]>;
  };
};

type GetDatas<
  TDatas extends readonly unknown[],
  TQueryFnDatas extends readonly unknown[],
> = {
  [K in keyof TDatas]: {
    select?: (data: TQueryFnDatas[K & keyof TQueryFnDatas]) => TDatas[K]
  }
}

type GetQueryKeys<TQueryKeys extends readonly QueryKey[]> = {
  [K in keyof TQueryKeys]: { queryKey: TQueryKeys[K] };
};

declare function useQueries<
  TQueryFnDatas extends readonly unknown[],
  TDatas extends readonly unknown[],
  TQueryKeys extends readonly QueryKey[]
>({
  queries,
}: {
  queries: [
    ...(GetQueryKeys<TQueryKeys> & GetDatas<TDatas, TQueryFnDatas> & GetQueryFnDatas<TQueryFnDatas, TQueryKeys>)
  ];
}): [TQueryFnDatas, TDatas, TQueryKeys];

const res = useQueries({
  queries: [
    {
      queryKey: ["todos"] as const,
      queryFn: (ctx) => Promise.resolve(5),
    //   select: (x) => [[x]] as const,
    },
    // {
    //   queryKey: ["users"] as const,
    //   queryFn: (ctx) => Promise.resolve(""),
    //   select: (x) => [x, x] as const,
    // },
  ],
});

res

// type Results<T> = {
//   [K in keyof T]: {
//     data: T[K];
//     onSuccess: (data: T[K]) => void;
//   };
// };

// type Errors<E> = {
//   [K in keyof E]: {
//     error: E[K];
//     onError: (data: E[K]) => void;
//   };
// };

// declare function withTuples<T extends any[], E extends any[]>(
//   arg: [...(Results<T> & Errors<E>)]
// ): [T, E];

// const res2 = withTuples([
//   {
//     data: "foo",
//     onSuccess: (dataArg) => {
//       dataArg;
//     },
//     error: 404,
//     onError: (errorArg) => {
//       errorArg;
//     },
//   },
//   {
//     data: true,
//     onSuccess: (dataArg) => {
//       dataArg;
//     },
//     error: 500,
//     onError: (errorArg) => {
//       errorArg;
//     },
//   },
// ]);

// declare function withKeyedObj<T, E>(
//   arg: Results<T> & Errors<E>
// ): [T, E];

// const res = withKeyedObj({
//   a: {
//     data: "foo",
//     onSuccess: (dataArg) => {
//       dataArg;
//     },
//     error: 404,
//     onError: (errorArg) => {
//       errorArg;
//     },
//   },
//   b: {
//     data: true,
//     onSuccess: (dataArg) => {
//       dataArg;
//     },
//     error: 500,
//     onError: (errorArg) => {
//       errorArg;
//     },
//   },
// });


// type Chain<R1, R2, R3> = {
//     a(): R1,
//     b(a: R1): R2;
//     c(b: R2): R3;
//     d(b: R3): void;
// };

// declare function test<R1, R2, R3>(foo: Chain<R1, R2, R3>): [R1, R2, R3]

// const res = test({
//     a: () => 0,
//     b: (a) => 'a',
//     c: (b) => {
//         return !!b
//     },
//     d: (c) => {
//         const x: boolean = c;
//     }
// });

// res