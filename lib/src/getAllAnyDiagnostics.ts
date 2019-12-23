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
  // 変数宣言は `ts.VariableDeclarationList` を起点に調べる
  // var a, b = '' などの様に宣言できるため。
  // const a = '' でも、VariableDeclarationList から絞る必要がある。
  if (ts.isVariableDeclarationList(node)) {
    // var a, b などの場合にも向けて、イテレータで処理しなければいけない
    ts.forEachChild(node, child => {
      // 変数宣言であれば
      if (ts.isVariableDeclaration(child)) {
        // 変数宣言数をインクリメント
        varDeclCount++
        try {
          // ts.TypeChecker を利用し
          // ts.Node(child) に推論されている型を調べる
          const { flags } = checker.getTypeAtLocation(child)
          // ts.TypeFlags は enum
          if (flags === ts.TypeFlags.Any) {
            const start = node.getStart()
            const {
              line // any が見つかった行
            } = source.getLineAndCharacterOfPosition(start)
            const location = `${source.fileName}:${line + 1}`
            const message = `👮‍♂️ < 御用だ！`
            // ログ出力用の文字列
            const diagnostic = `${location} ${message}`
            diagnostics.push(diagnostic)
          }
        } catch (err) {
          // TODO: checker.getTypeAtLocation(child) で以下エラーがでる Node がある
          // TypeError: Cannot read property 'flags' of undefined
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
    // 収集した any診断を追加
    srcDiagnostics.push(diagnostics)
    // ファイル内変数宣言数を加算
    srcVarDeclCount += varDeclCount
    // visit関数の再帰呼び出し
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
export function getAllAnyDiagnostics(
  checker: ts.TypeChecker,
  sources: readonly ts.SourceFile[]
) {
  let totalVarDeclCount = 0
  let totalAnyDeclCount = 0
  let allDiagnostics: string[][] = []
  sources.forEach(source => {
    const {
      srcDiagnostics, // string[]
      srcVarDeclCount // number
    } = getSourceAnyDiagnostics(checker, source)
    // 得られたany診断メッセージ配列
    allDiagnostics.push(srcDiagnostics)
    // src に書かれている変数を加算
    totalVarDeclCount += srcVarDeclCount
  })
  let _allDiagnostics = allDiagnostics.flat()
  // 得られたany診断メッセージ数
  totalAnyDeclCount = _allDiagnostics.length
  // ログ出力用のメッセージを整形
  const errorMessage = totalAnyDeclCount
    ? _allDiagnostics.reduce((a, b) => `${a}\n${b}`)
    : null
  // 全変数推論の非anyカバレッジを0〜1で表す
  const coverage = totalVarDeclCount
    ? 1 - totalAnyDeclCount / totalVarDeclCount
    : 1
  return {
    totalVarDeclCount,
    totalAnyDeclCount,
    allDiagnostics: _allDiagnostics,
    errorMessage,
    coverage
  }
}
// ______________________________________________________
//
export type SourcesAnyDiagnostics = ReturnType<
  typeof getAllAnyDiagnostics
>
