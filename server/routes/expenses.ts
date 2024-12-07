import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const expenseSchema = z.object({
  id: z.number().int().positive().min(1),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
});

type Expense = z.infer<typeof expenseSchema>;

const createPostSchemaa = expenseSchema.omit({ id: true });

const fakeExpenses: Expense[] = [
  {
    id: 1,
    title: "Rent",
    amount: 1000,
  },
  {
    id: 2,
    title: "Groceries",
    amount: 500,
  },
  {
    id: 3,
    title: "Utilities",
    amount: 150,
  },
  {
    id: 4,
    title: "Transportation",
    amount: 200,
  },
  {
    id: 5,
    title: "Entertainment",
    amount: 300,
  },
];

export const expensesRoute = new Hono()
  .get("/", async (c) => {
    return c.json({ expenses: fakeExpenses });
  })

  .post("/", zValidator("json", createPostSchemaa), async (c) => {
    const data = await c.req.valid("json");
    fakeExpenses.push({ ...data, id: fakeExpenses.length + 1 });
    return c.json(fakeExpenses);
  })

  .get("/total-spent", (c) => {
    const total = fakeExpenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    return c.json({ total });
  })

  .get("/:id{[0-9]+}", (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const expense = fakeExpenses.find((expense) => expense.id === id);

    if (!expense) {
      return c.notFound();
    }

    return c.json({ expense });
  })

  .delete("/:id{[0-9]+}", (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const index = fakeExpenses.findIndex((expense) => expense.id === id);

    if (index === -1) {
      return c.notFound();
    }

    const deletedExpense = fakeExpenses.splice(index, 1)[0];
    return c.json({ expense: deletedExpense });
  });
