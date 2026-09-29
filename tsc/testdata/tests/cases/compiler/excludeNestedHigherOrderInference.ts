// @strict: true
// @noEmit: true

// Reduced from Effect's 'flow(Effect.provideService(A, ...), Effect.provideService(B, ...))'.

interface Tag<in out Id, in out Service> {
  readonly id: Id;
  readonly service: Service;
}

interface Effect<out A, out E, out R> {
  readonly a: A;
  readonly e: E;
  readonly r: R;
}

declare function provideService<I, S>(
  tag: Tag<I, S>,
  service: NoInfer<S>,
): <A, E, R>(self: Effect<A, E, R>) => Effect<A, E, Exclude<R, I>>;

declare function flow<A extends ReadonlyArray<unknown>, B, C>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
): (...a: A) => C;

interface ServiceA {
  readonly a: unique symbol;
}
interface ServiceB {
  readonly b: unique symbol;
}

declare const TagA: Tag<ServiceA, {}>;
declare const TagB: Tag<ServiceB, {}>;

const provideAll = flow(provideService(TagA, {}), provideService(TagB, {}));

const provideAllMerged: <A, E, R>(self: Effect<A, E, R>) => Effect<A, E, Exclude<R, ServiceA | ServiceB>> = provideAll;
const provideAllNested: <A, E, R>(self: Effect<A, E, R>) => Effect<A, E, Exclude<Exclude<R, ServiceA>, ServiceB>> = provideAll;
