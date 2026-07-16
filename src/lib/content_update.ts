import EventEmitter from "node:events";

type CUType = 'sync' | 'desync';

export class Constraint extends EventEmitter<{ "resolved": [] }> {
  constructor() {
    super();
  }

  resolve() {
    this.emit("resolved");
  }
}

export class CUCont {
  type: CUType;

  contains = new Set<CU>();
  last?: CU;

  children = new Set<CUCont>();

  pending: (() => any)[] = [];

  constructor(type: CUType) {
    this.type = type;
  }

  convert(targetType: CUType) {
    if (this.type === targetType) return;

    if (targetType === 'desync') {
      const lastReachable = this.last?.xLastReachable();
      if (lastReachable) {
        let current = lastReachable.rightDependant;
        while (current) {
          current.convert(targetType);
          current = current.rightDependant; // LTR Traversal
        }
      }
    }

    if (targetType === 'sync') {
      let current = this.last;
      while (current) {
        current.convert(targetType);
        current = current?.leftDependency;
      }
    }

    this.type = targetType;
  }

  appendAction(action: (() => any)) {
    this.pending.push(action);
  }

  commit(constraints: Constraint[]) {
    const cu = new CU(this, this.pending, constraints);
    this.pending = [];

    this.last = cu;
  }
}

interface LTRTraversable<T> {
  rightDependant?: T;
}

export class CU implements LTRTraversable<CU> {
  leftDependency?: CU;
  bottomDependencies = new Set<CU>();
  get dependencies() {
    const result: CU[] = [];

    if (this.leftDependency) result.push(this.leftDependency);
    if (this.bottomDependencies) this.bottomDependencies.forEach((v) => result.push(v));

    return result;
  }

  rightDependant?: CU;
  topDependant?: CU;
  get dependants() {
    const result: CU[] = [];

    if (this.rightDependant) result.push(this.rightDependant);
    if (this.topDependant) result.push(this.topDependant);

    return result;
  }

  activeConstraints = new Set<Constraint>();

  addConstraint(constraint: Constraint) {
    this.activeConstraints.add(constraint);

    constraint.on("resolved", () => {
      this.activeConstraints.delete(constraint);

      this.tryApply();
    });
  }

  type: CUType;
  actions: (() => any)[];
  container: CUCont;

  constructor(container: CUCont, actions: (() => any)[], constraints: Constraint[]) {
    this.type = container.type;
    this.container = container;

    this.actions = actions;

    if (container.last) this.addDependencyX(container.last);
    for (const child of container.children) {
      if (
        child.last &&
        child.last.type === 'sync' &&
        !child.last.reachable()
      ) this.addDependencyY(child.last);
    }

    constraints.forEach((c) => this.activeConstraints.add(c));

    this.tryApply();
  }

  convert(targetType: CUType) {
    if (this.type === targetType) return;

    this.type = targetType;

    if (targetType === 'desync') {


      this.tryApply();
    }
  }

  addDependencyX(dependency: CU) {
    this.leftDependency = dependency;
    dependency.rightDependant = this;
  }
  addDependencyY(dependency: CU) {
    this.bottomDependencies.add(dependency);
    dependency.topDependant = this;
  }

  executed = false;

  reachable(): boolean {
    if (this.type === 'desync') return true;

    return this.dependants.some((v) => v.reachable());
  }

  async run() {
    if (this.executed) return;
    this.executed = true;

    await this.leftDependency?.run();
    await Promise.all([...(this.bottomDependencies || [])].map((cu) => cu.run()));

    await Promise.all(this.actions.map((fn) => fn()));
    this.removeFromAll();
  }

  // Utility function to check, from last, which object is last reachable by DCU
  xLastReachable(): LTRTraversable<CU> {
    if (this.topDependant?.reachable()) return this;

    return this.leftDependency?.xLastReachable() || { rightDependant: this };
  }

  allOk(): boolean {
    if (this.activeConstraints.size !== 0) return false;
    else return this.dependencies.every((v) => v.allOk());
  }

  async tryApply() {
    if (!this.allOk()) return false;

    if (this.type === 'sync') {
      await Promise.all(this.recursiveDesyncDependants().map((v) => v.tryApply()));
    } else {
      await this.run();
    }
  }

  removeFromCUsOutsideQueue() {
    // See https://wayland.app/protocols/wayland#wl_surface:request:commit
    if (this.topDependant) this.topDependant.bottomDependencies.delete(this);
  }
  removeFromCUInsideQueue() {
    if (this.rightDependant) this.rightDependant.leftDependency = undefined;
  }
  removeFromQueue() {
    this.container.contains.delete(this);
    if (this.container.last === this) delete this.container.last;
  }

  removeFromAll() {
    this.removeFromCUInsideQueue();
    this.removeFromCUsOutsideQueue();
    this.removeFromQueue();
  }

  recursiveDesyncDependants(): CU[] {
    return [
      ...(this.type === 'desync' ? [this] : []),
      ...(this.topDependant?.recursiveDesyncDependants() || []),
      ...(this.rightDependant?.recursiveDesyncDependants() || []),
    ];
  }
}
