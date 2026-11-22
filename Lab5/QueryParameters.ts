
import type { Express, Request, Response } from "express";

export default function QueryParameters(app: Express) {
  const calculator = (req: Request, res: Response) => {
    const { a, b, operation } = req.query;

    const numA = Number(a);
    const numB = Number(b);
    let result: number | string = 0;

    switch (operation) {
      case "add":
        result = numA + numB;
        break;
      case "subtract":
        result = numA - numB;
        break;
      case "multiply":
        result = numA * numB;
        break;
      case "divide":
        result = numA / numB;
        break;
      default:
        result = "Invalid operation";
    }

    res.send(result.toString());
  };

  app.get("/lab5/calculator", calculator);
}
