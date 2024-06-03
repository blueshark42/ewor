
export const getAllNaPredajFromDateToDate = async (
  from: Date,
  to: Date,
  onlyAmountMoreThanZero = true
): Promise<Sklad[]> => {
  try {
    if (!activeDb || activeDb === undefined) {
      console.error('Database does not exist');
      return [];
    }
    const millisFrom = from.getTime();
    const millisTo = to.getTime();
    const sklady = activeDb.sklad.filter((sklad) => {
      const millisDate = Date.parse(sklad.datum);
      if (millisFrom > millisDate || millisDate > millisTo) {
        return false;
      }
      return isXWeeksPassed(Date.parse(sklad.datum), sklad.akciatyzdne);
    });

    const validData = (await sklady.toArray()).sort((a: Sklad, b: Sklad) => (b.zmluvycisl ?? 0) - (a.zmluvycisl ?? 0));

    return onlyAmountMoreThanZero ? validData.filter((obj) => obj.pocet > 0) : validData;
  } catch (error) {
    console.error('Error retrieving getAllNaPredaj:', error);
    return [];
  }
};

// GET BY ID
export const getSkladById = async (id: number): Promise<Sklad | null> => {
  try {
    if (!activeDb || activeDb === undefined) {
      console.error('Database does not exist');
      return null;
    }
    const sklad = await activeDb.sklad.get(id);
    return sklad || null;
  } catch (error) {
    console.error('Error retrieving sklad by ID:', error);
    return null;
  }
};

// UPDATE
export const updateSklad = async (id: number, newData: Partial<Sklad>): Promise<void> => {
  try {
    if (!activeDb || activeDb === undefined) {
      console.error('Database does not exist');
      return;
    }
    await activeDb.sklad.update(id, newData);
    // console.log('Sklad updated successfully!');
  } catch (error) {
    console.error('Error updating sklad:', error);
  }
};
