import { ASTLocation } from "../../types";

let loadParser = () =>
  import("@babel/parser").then(({ parse }) => {
    loadParser = () => Promise.resolve(parse);
    return parse;
  });

let loadAstTypes = () =>
  import("ast-types").then(({ visit }) => {
    loadAstTypes = () => Promise.resolve(visit);
    return visit;
  });

export const parsePosition = (text?: string) => {
  if (!text) return [];
  return Promise.all([loadParser(), loadAstTypes()])
    .then(([parse, visit]) => {
      try {
        const ast = parse(text, {
          sourceType: "module",
          plugins: ["jsx", "typescript", "classProperties"],
        });
        const codeLocs: Array<ASTLocation | undefined | null> = [];
        visit(ast, {
          visitClassDeclaration(path) {
            codeLocs.push(path.node.loc);
            this.traverse(path);
          },
          visitClassMethod(path) {
            codeLocs.push(path.node.loc);
            this.traverse(path);
          },
          visitFunction(path) {
            codeLocs.push(path.node.loc);
            this.traverse(path);
          },
        });
        return codeLocs.filter((it) => !!it);
      } catch (error) {
        return [];
      }
    })
    .catch(() => {
      console.warn("parse position error");
      return [];
    });
};
