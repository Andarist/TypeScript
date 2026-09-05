package checker

import "github.com/microsoft/TypeScript/tsc/internal/ast"

func (l *NodeLinks) getFlags() NodeCheckFlags      { return l.flagsCache.get(&l.speculatableLinks) }
func (l *NodeLinks) setFlags(value NodeCheckFlags) { l.flagsCache.set(&l.speculatableLinks, value) }
func (l *NodeLinks) getContextFreeType() *Type {
	return l.contextFreeTypeCache.get(&l.speculatableLinks)
}
func (l *NodeLinks) setContextFreeType(value *Type) {
	l.contextFreeTypeCache.set(&l.speculatableLinks, value)
}
func (l *TypeNodeLinks) getResolvedType() *Type { return l.resolvedTypeCache.get(&l.speculatableLinks) }
func (l *TypeNodeLinks) setResolvedType(value *Type) {
	l.resolvedTypeCache.set(&l.speculatableLinks, value)
}
func (l *SymbolNodeLinks) getResolvedSymbol() *ast.Symbol {
	return l.resolvedSymbolCache.get(&l.speculatableLinks)
}
func (l *SymbolNodeLinks) setResolvedSymbol(value *ast.Symbol) {
	l.resolvedSymbolCache.set(&l.speculatableLinks, value)
}
func (l *ValueSymbolLinks) getResolvedType() *Type {
	return l.resolvedTypeCache.get(&l.speculatableLinks)
}
func (l *ValueSymbolLinks) setResolvedType(value *Type) {
	l.resolvedTypeCache.set(&l.speculatableLinks, value)
}
func (l *ValueSymbolLinks) getWriteType() *Type { return l.writeTypeCache.get(&l.speculatableLinks) }
func (l *ValueSymbolLinks) setWriteType(value *Type) {
	l.writeTypeCache.set(&l.speculatableLinks, value)
}
func (l *ValueSymbolLinks) getNameType() *Type      { return l.nameTypeCache.get(&l.speculatableLinks) }
func (l *ValueSymbolLinks) setNameType(value *Type) { l.nameTypeCache.set(&l.speculatableLinks, value) }
func (l *ValueSymbolLinks) getFunctionOrConstructorChecked() bool {
	return l.functionOrConstructorCheckedCache.get(&l.speculatableLinks)
}
func (l *ValueSymbolLinks) setFunctionOrConstructorChecked(value bool) {
	l.functionOrConstructorCheckedCache.set(&l.speculatableLinks, value)
}
func (l *SignatureLinks) getResolvedSignature() *Signature {
	return l.resolvedSignatureCache.get(&l.speculatableLinks)
}
func (l *SignatureLinks) setResolvedSignature(value *Signature) {
	l.resolvedSignatureCache.set(&l.speculatableLinks, value)
}
func (l *SignatureLinks) getEffectsSignature() *Signature {
	return l.effectsSignatureCache.get(&l.speculatableLinks)
}
func (l *SignatureLinks) setEffectsSignature(value *Signature) {
	l.effectsSignatureCache.set(&l.speculatableLinks, value)
}
func (l *AssertionLinks) getExprType() *Type      { return l.exprTypeCache.get(&l.speculatableLinks) }
func (l *AssertionLinks) setExprType(value *Type) { l.exprTypeCache.set(&l.speculatableLinks, value) }
func (l *SwitchStatementLinks) getSwitchTypes() []*Type {
	return l.switchTypesCache.get(&l.speculatableLinks)
}
func (l *SwitchStatementLinks) setSwitchTypes(value []*Type) {
	l.switchTypesCache.set(&l.speculatableLinks, value)
}
func (l *SwitchStatementLinks) getSwitchTypesComputed() bool {
	return l.switchTypesComputedCache.get(&l.speculatableLinks)
}
func (l *SwitchStatementLinks) setSwitchTypesComputed(value bool) {
	l.switchTypesComputedCache.set(&l.speculatableLinks, value)
}
func (l *SwitchStatementLinks) getWitnesses() []string {
	return l.witnessesCache.get(&l.speculatableLinks)
}
func (l *SwitchStatementLinks) setWitnesses(value []string) {
	l.witnessesCache.set(&l.speculatableLinks, value)
}
func (l *SwitchStatementLinks) getWitnessesComputed() bool {
	return l.witnessesComputedCache.get(&l.speculatableLinks)
}
func (l *SwitchStatementLinks) setWitnessesComputed(value bool) {
	l.witnessesComputedCache.set(&l.speculatableLinks, value)
}
func (l *SwitchStatementLinks) getExhaustiveState() ExhaustiveState {
	return l.exhaustiveStateCache.get(&l.speculatableLinks)
}
func (l *SwitchStatementLinks) setExhaustiveState(value ExhaustiveState) {
	l.exhaustiveStateCache.set(&l.speculatableLinks, value)
}
