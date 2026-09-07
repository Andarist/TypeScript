package checker

import "github.com/microsoft/TypeScript/tsc/internal/ast"

// Node link setters take the checker so the structs themselves stay pointer
// free; symbol links carry their host because their reads need it too.

func (l *NodeLinks) getFlags() NodeCheckFlags { return l.flagsCache.get() }
func (l *NodeLinks) setFlags(c *Checker, value NodeCheckFlags) {
	l.flagsCache.set(&c.speculationHost, value)
}

func (l *TypeNodeLinks) getResolvedType() *Type { return l.resolvedTypeCache.get() }
func (l *TypeNodeLinks) setResolvedType(c *Checker, value *Type) {
	l.resolvedTypeCache.set(&c.speculationHost, value)
}

func (l *SymbolNodeLinks) getResolvedSymbol() *ast.Symbol { return l.resolvedSymbolCache.get() }
func (l *SymbolNodeLinks) setResolvedSymbol(c *Checker, value *ast.Symbol) {
	l.resolvedSymbolCache.set(&c.speculationHost, value)
}

// For identifiers, whose resolution does not depend on speculative state. The
// caller must keep any diagnostics it reported permanent as well.
func (l *SymbolNodeLinks) setResolvedSymbolPermanently(value *ast.Symbol) {
	l.resolvedSymbolCache.value = value
}

func (l *ValueSymbolLinks) getResolvedType() *Type {
	return l.resolvedTypeCache.get(l)
}

func (l *ValueSymbolLinks) setResolvedType(value *Type) {
	l.resolvedTypeCache.set(l, value)
}

func (l *ValueSymbolLinks) getWriteType() *Type {
	return l.writeTypeCache.get(l)
}

func (l *ValueSymbolLinks) setWriteType(value *Type) {
	l.writeTypeCache.set(l, value)
}

func (l *ValueSymbolLinks) getNameType() *Type {
	return l.nameTypeCache.get(l)
}

func (l *ValueSymbolLinks) setNameType(value *Type) {
	l.nameTypeCache.set(l, value)
}

func (l *ValueSymbolLinks) getFunctionOrConstructorChecked() bool {
	return l.functionOrConstructorCheckedCache.get(l)
}

func (l *ValueSymbolLinks) setFunctionOrConstructorChecked(value bool) {
	l.functionOrConstructorCheckedCache.set(l, value)
}

func (l *SignatureLinks) getResolvedSignature() *Signature { return l.resolvedSignatureCache.get() }
func (l *SignatureLinks) setResolvedSignature(c *Checker, value *Signature) {
	l.resolvedSignatureCache.set(&c.speculationHost, value)
}

func (l *SignatureLinks) getEffectsSignature() *Signature { return l.effectsSignatureCache.get() }
func (l *SignatureLinks) setEffectsSignature(c *Checker, value *Signature) {
	l.effectsSignatureCache.set(&c.speculationHost, value)
}

func (l *AssertionLinks) getExprType() *Type { return l.exprTypeCache.get() }
func (l *AssertionLinks) setExprType(c *Checker, value *Type) {
	l.exprTypeCache.set(&c.speculationHost, value)
}

func (l *SwitchStatementLinks) getSwitchTypes() []*Type { return l.switchTypesCache.get() }
func (l *SwitchStatementLinks) setSwitchTypes(c *Checker, value []*Type) {
	l.switchTypesCache.set(&c.speculationHost, value)
}

func (l *SwitchStatementLinks) getSwitchTypesComputed() bool { return l.switchTypesComputedCache.get() }
func (l *SwitchStatementLinks) setSwitchTypesComputed(c *Checker, value bool) {
	l.switchTypesComputedCache.set(&c.speculationHost, value)
}

func (l *SwitchStatementLinks) getWitnesses() []string { return l.witnessesCache.get() }
func (l *SwitchStatementLinks) setWitnesses(c *Checker, value []string) {
	l.witnessesCache.set(&c.speculationHost, value)
}

func (l *SwitchStatementLinks) getWitnessesComputed() bool { return l.witnessesComputedCache.get() }
func (l *SwitchStatementLinks) setWitnessesComputed(c *Checker, value bool) {
	l.witnessesComputedCache.set(&c.speculationHost, value)
}

func (l *SwitchStatementLinks) getExhaustiveState() ExhaustiveState {
	return l.exhaustiveStateCache.get()
}
func (l *SwitchStatementLinks) setExhaustiveState(c *Checker, value ExhaustiveState) {
	l.exhaustiveStateCache.set(&c.speculationHost, value)
}
