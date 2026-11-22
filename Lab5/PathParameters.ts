import type { Express, Request, Response } from "express";

export default function PathParameters(app: Express) {
  const add = (req: Request, res: Response) => {
    const { a, b } = req.params;
    const sum = parseInt(a as string) + parseInt(b as string);
    res.send(sum.toString());
  };

  const subtract = (req: Request, res: Response) => {
    const { a, b } = req.params;
    const difference = parseInt(a as string) - parseInt(b as string);
    res.send(difference.toString());
  };

  const multiply = (req: Request, res: Response) => {
    const { a, b } = req.params;
    res.send(
      (parseInt(a as string) * parseInt(b as string)).toString()
    );
  };

  const divide = (req: Request, res: Response) => {
    const { a, b } = req.params;
    res.send(
      (parseInt(a as string) / parseInt(b as string)).toString()
    );
  };

  app.get("/lab5/add/:a/:b", add);
  app.get("/lab5/subtract/:a/:b", subtract);
  app.get("/lab5/multiply/:a/:b", multiply);
  app.get("/lab5/divide/:a/:b", divide);
}