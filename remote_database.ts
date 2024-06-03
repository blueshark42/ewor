
// AddNewContract
app.post("/api/contracts", async (req, res) => {
  const {
    date,
    amount,
    client_id,
    agreement_validity_days,
    interest,
    item,
    price,
    return_sold_amount,
    is_returned,
    is_sold,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO contracts (date, amount, client_id, agreement_validity_days, interest, item, price, return_sold_amount, is_returned, is_sold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        date,
        amount,
        client_id,
        agreement_validity_days,
        interest,
        item,
        price,
        return_sold_amount,
        is_returned,
        is_sold,
      ]
    );
    res.json({ message: "Contract added successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the contract" });
  }
});

// UpdateContract
app.put("/api/contracts/:id", async (req, res) => {
  const { id } = req.params;
  const fieldsToUpdate = req.body;

  try {
    const setClause = Object.keys(fieldsToUpdate)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE contracts SET ${setClause} WHERE id = $${
        Object.keys(fieldsToUpdate).length + 1
      } RETURNING *`,
      [...Object.values(fieldsToUpdate), id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DeleteContract
app.delete("/api/contracts/:id", async (req, res) => {
  const contractId = req.params.id;
  try {
    await pool.query("DELETE FROM contracts WHERE id = $1", [contractId]);
    res.json({ message: "Contract deleted successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the contract" });
  }
});

// -----------------------------------------------------------------------------

app.get("/api/units", async (req, res) => {
  try {
    const query = "SELECT * FROM units;";
    const result = await pool.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
// -----------------------------------------------------------------------------
