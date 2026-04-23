import express from "express";
    console.error("RESULTS ERROR:", error.message);
    res.status(500).json({
      error: "Nepodarilo sa načítať výsledky.",
      detail: error.message,
    });
  }
});

app.get("/api/table", async (req, res) => {
  try {
    const result = await getOrLoadCache("table", async () => {
      const html = await fetchHtml(URLS.table);
      const text = extractTextFromHtml(html);
      return parseTable(text);
    });

    res.json({
      source: URLS.table,
      cached: result.cached,
      fetchedAt: new Date(result.fetchedAt).toISOString(),
      items: result.data,
    });
  } catch (error) {
    console.error("TABLE ERROR:", error.message);
    res.status(500).json({
      error: "Nepodarilo sa načítať tabuľku.",
      detail: error.message,
    });
  }
});

app.post("/api/refresh", async (req, res) => {
  try {
    const [programHtml, resultsHtml, tableHtml] = await Promise.all([
      fetchHtml(URLS.program),
      fetchHtml(URLS.results),
      fetchHtml(URLS.table),
    ]);

    cache.program = {
      data: parseProgram(extractTextFromHtml(programHtml)),
      fetchedAt: Date.now(),
    };

    cache.results = {
      data: parseResults(extractTextFromHtml(resultsHtml)),
      fetchedAt: Date.now(),
    };

    cache.table = {
      data: parseTable(extractTextFromHtml(tableHtml)),
      fetchedAt: Date.now(),
    };

    res.json({
      ok: true,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("REFRESH ERROR:", error.message);
    res.status(500).json({
      error: "Nepodarilo sa obnoviť cache.",
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Futbalnet backend beží na http://localhost:${PORT}`);
});
