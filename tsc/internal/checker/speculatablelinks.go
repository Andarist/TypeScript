package checker

import "github.com/microsoft/TypeScript/tsc/internal/ast"

// Link accessors that touch speculative state take the checker, so the link
// structs themselves carry no pointer to it.

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

func (l *ValueSymbolLinks) getResolvedType(c *Checker) *Type {
	return l.resolvedTypeCache.get(&c.speculationHost, l)
}

func (l *ValueSymbolLinks) setResolvedType(c *Checker, value *Type) {
	l.resolvedTypeCache.set(&c.speculationHost, l, value)
}

func (l *ValueSymbolLinks) getWriteType(c *Checker) *Type {
	return l.writeTypeCache.get(&c.speculationHost, l)
}

func (l *ValueSymbolLinks) setWriteType(c *Checker, value *Type) {
	l.writeTypeCache.set(&c.speculationHost, l, value)
}

func (l *ValueSymbolLinks) getNameType(c *Checker) *Type {
	return l.nameTypeCache.get(&c.speculationHost, l)
}

func (l *ValueSymbolLinks) setNameType(c *Checker, value *Type) {
	l.nameTypeCache.set(&c.speculationHost, l, value)
}

func (l *ValueSymbolLinks) getFunctionOrConstructorChecked(c *Checker) bool {
	return l.functionOrConstructorCheckedCache.get(&c.speculationHost, l)
}

func (l *ValueSymbolLinks) setFunctionOrConstructorChecked(c *Checker, value bool) {
	l.functionOrConstructorCheckedCache.set(&c.speculationHost, l, value)
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
