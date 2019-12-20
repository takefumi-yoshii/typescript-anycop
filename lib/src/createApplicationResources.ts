import * as ts from 'typescript'
import { createConfigFileHost } from './createConfigFileHost'
// ______________________________________________________
//
export function createApplicationResources(
  searchPath: string,
  configName = 'tsconfig.json'
) {
  // 調べる対象になるプロジェクトディレクトリから tsconfig を探す
  const configPath = ts.findConfigFile(
    searchPath,
    ts.sys.fileExists,
    configName
  )
  if (!configPath) {
    throw new Error("Could not find 'tsconfig.json'.")
  }
  // 見つけた tsconfig を元に
  // ts.ParsedCommandLine を取得
  const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    createConfigFileHost()
  )
  if (!parsedCommandLine) {
    throw new Error('invalid parsedCommandLine.')
  }
  if (parsedCommandLine.errors.length) {
    throw new Error('parsedCommandLine has errors.')
  }
  // ts.Program を作成
  const program = ts.createProgram({
    rootNames: parsedCommandLine.fileNames,
    options: parsedCommandLine.options
  })
  // ts.TypeChecker を取得
  // ts.Node だけでは得られない、型推論内容の確認ができる
  const checker = program.getTypeChecker()
  return {
    program,
    checker
  }
}
