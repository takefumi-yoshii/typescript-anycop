import * as ts from 'typescript'
// ______________________________________________________
//
function getAnyDiagnostics(
  checker: ts.TypeChecker,
  source: ts.SourceFile,
  node: ts.Node
) {
  let varDeclCount = 0
  let diagnostics: string[] = []
  if (ts.isVariableDeclarationList(node)) {
    ts.forEachChild(node, child => {
      // 変数宣言であれば
      if (ts.isVariableDeclaration(child)) {
        // 変数宣言数をインクリメント
        varDeclCount++
        // ts.TypeChecker を利用し
        // ts.Node(child) に推論されている型を調べる
        const flags = checker.getTypeAtLocation(child).flags
        // ts.TypeFlags は enum
        if (flags === ts.TypeFlags.Any) {
          const start = node.getStart()
          const {
            line // any が見つかった行
          } = source.getLineAndCharacterOfPosition(start)
          const location = `${source.fileName}:${line + 1}`
          const message = `👮‍♂️ <${child.getFullText()}`
          // ログ出力用の文字列
          const diagnostic = `${location} ${message}`
          diagnostics.push(diagnostic)
        }
      }
    })
  }
  return {
    diagnostics,
    varDeclCount
  }
}
// ______________________________________________________
//
function getSourceAnyDiagnostics(
  checker: ts.TypeChecker,
  source: ts.SourceFile
) {
  let srcVarDeclCount = 0
  let srcDiagnostics: string[][] = []
  function visit(node: ts.Node) {
    const { diagnostics, varDeclCount } = getAnyDiagnostics(
      checker,
      source,
      node
    )
    // node で発見した any診断メッセージ配列を push
    srcDiagnostics.push(diagnostics)
    // src に書かれている変数を加算
    srcVarDeclCount += varDeclCount
    // visit関数の再起呼び出し
    ts.forEachChild(node, visit)
  }
  // ts.SourceFile を起点に実行
  visit(source)
  return {
    srcDiagnostics: srcDiagnostics.flat(),
    srcVarDeclCount
  }
}
// ______________________________________________________
//
export function getSourcesAnyDiagnostics(
  checker: ts.TypeChecker,
  sources: readonly ts.SourceFile[]
) {
  let allVarDeclCount = 0
  let allAnyDeclCount = 0
  let allDiagnostics: string[][] = []
  sources.forEach(source => {
    const {
      srcDiagnostics, // string[]
      srcVarDeclCount // number
    } = getSourceAnyDiagnostics(checker, source)
    // 得られたany診断メッセージ配列
    allDiagnostics.push(srcDiagnostics)
    // src に書かれている変数を加算
    allVarDeclCount += srcVarDeclCount
  })
  let _allDiagnostics = allDiagnostics.flat()
  // 得られたany診断メッセージ数
  allAnyDeclCount = _allDiagnostics.length
  // ログ出力用のメッセージを整形
  const errorMessage = allAnyDeclCount
    ? _allDiagnostics.reduce((a, b) => `${a}\n${b}`)
    : null
  // 全変数推論の非anyカバレッジを0〜1で表す
  const coverage = allVarDeclCount
    ? 1 - allAnyDeclCount / allVarDeclCount
    : 1
  return {
    allVarDeclCount,
    allAnyDeclCount,
    allDiagnostics: _allDiagnostics,
    errorMessage,
    coverage
  }
}
