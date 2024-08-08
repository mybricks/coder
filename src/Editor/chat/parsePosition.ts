import { ASTLocation } from "../../types";

export const parsePosition = (text?: string) => {
  if (!text) return [];
  return Promise.all([import("@babel/parser"), import("ast-types")])
    .then(([{ parse }, { visit }]) => {
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
        console.warn(error);
        return [];
      }
    })
    .catch(() => {
      console.warn("parse position error");
      return [];
    });
};
