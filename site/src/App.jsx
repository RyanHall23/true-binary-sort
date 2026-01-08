import React, { useState } from "react";
import TrueBinarySort from 'true-binary-sort'
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);

  const handleTest = () => {
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch {
      parsed = input;
    }

    try {
      const binaryStrings = TrueBinarySort(parsed, { returnOriginal: false });
      const originalReordered = TrueBinarySort(parsed, { returnOriginal: true });
      
      setOutput({
        input: parsed,
        binaryStrings,
        originalReordered,
      });
    } catch (e) {
      setOutput({
        error: e.message,
      });
    }
  };

  // Sample arrays for tabs
  const primitives = [
    { label: "Number (42)", data: 42 },
    { label: "String ('hello')", data: "hello" },
    { label: "Boolean (true)", data: true },
    { label: "Boolean (false)", data: false },
    { label: "BigInt (123n)", data: BigInt(123) }
  ];
  const specialValues = [
    { label: "null", data: null },
    { label: "undefined", data: undefined },
    { label: "NaN", data: NaN },
    { label: "Infinity", data: Infinity },
    { label: "-Infinity", data: -Infinity }
  ];
  const collections = [
    { label: "Array [1,2,3]", data: [1, 2, 3] },
    { label: "Object {a:1,b:2}", data: { a: 1, b: 2 } },
    { label: "Nested Array", data: [[1, 2], [3, 4]] },
    { label: "Nested Object", data: { x: { y: 2 } } }
  ];

  const builtins = [
    { label: "Date (now)", data: new Date() },
    { label: "RegExp (/test/)", data: /test/ },
    { label: "Error", data: new Error("test error") },
    { label: "Array (literal)", data: [] },
    { label: "Object (literal)", data: {} },
  ];

  // Complex Examples
  const complex = [
    { 
      label: "Sorting Numbers by Bit Count", 
      data: [3, 1, 7]
    },
    { 
      label: "Mixed Types", 
      data: [false, 2, "hi", true, 1]
    },
    { 
      label: "Object with Mixed Values",
      data: { id: 42, active: true, tags: ["a", "b"], nested: { x: 1 } }
    },
    {
      label: "Array of Objects",
      data: [{ val: 5 }, { val: 1 }, { val: 10 }]
    }
  ];

  const testSample = (data) => {
    // Custom stringify to handle BigInt
    function safeStringify(val) {
      return JSON.stringify(val, (key, value) =>
        typeof value === 'bigint' ? value.toString() + 'n' : value,
        2
      );
    }
    setInput(safeStringify(data));
    setTimeout(() => {
      try {
        const binaryStrings = TrueBinarySort(data, { returnOriginal: false });
        const originalReordered = TrueBinarySort(data, { returnOriginal: true });
        setOutput({
          input: data,
          binaryStrings,
          originalReordered,
        });
      } catch (e) {
        setOutput({
          error: e.message,
        });
      }
    }, 0);
  };

  function formatBigIntSafe(data) {
    // Handle built-ins and special values
    if (data instanceof Date) return data.toISOString();
    if (data instanceof RegExp) return data.toString();
    if (data instanceof Error) return data.toString();
    if (typeof data === 'undefined') return 'undefined';
    if (typeof data === 'number' && isNaN(data)) return 'NaN';
    if (data === Infinity) return 'Infinity';
    if (data === -Infinity) return '-Infinity';
    if (data === null) return 'null';
      if (typeof data === 'bigint') return data.toString() + 'n';
      return JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') return value.toString() + 'n';
        if (value instanceof Date) return value.toISOString();
        if (value instanceof RegExp) return value.toString();
        if (value instanceof Error) return value.toString();
        if (typeof value === 'undefined') return 'undefined';
        if (typeof value === 'number' && isNaN(value)) return 'NaN';
        if (value === Infinity) return 'Infinity';
        if (value === -Infinity) return '-Infinity';
        return value;
      }, 2);
  }

  const renderSampleButtons = (samples) => (
    <div className="samples">
      {samples.map((item, idx) => (
        <button 
          key={idx} 
          onClick={() => testSample(item.data)}
          className="sample-btn"
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  const [activeTab, setActiveTab] = useState("custom");

  const formatBinaryOutput = (data) => {
    if (typeof data === "string") {
      return `"${data}"`;
    }
    if (Array.isArray(data)) {
      return formatBigIntSafe(
        data.map(item => typeof item === "string" ? item : formatBigIntSafe(item))
      );
    }
    if (typeof data === "object" && data !== null) {
      const formatted = {};
      for (const [key, value] of Object.entries(data)) {
        formatted[key] = typeof value === "string" ? value : formatBigIntSafe(value);
      }
      return formatBigIntSafe(formatted);
    }
    return formatBigIntSafe(data);
  };

  const formatOriginalOutput = (data) => {
    return formatBigIntSafe(data);
  };

  return (
    <div className="main-wrapper">
      <div className="container">
      <header>
        <h1>TrueBinarySort Test Bed</h1>
        <p>
          Deterministic • Universal • Stable • Totally Pointless
        </p>
        <p className="subtitle">
          Converts any input to binary, sorts bits (0s first), returns sorted result
        </p>
      </header>

      <div className="left-column">
        <section className="controls">
          <div className="option-toggle">
            <p className="hint">
              All results show both the binary representation and original values reordered
            </p>
          </div>
        </section>

        <section className="input-section">
          <h2>Custom Input</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter JSON, string, number, boolean, array, object, or raw data"
            rows="6"
          />
          <button onClick={handleTest} className="primary-btn">
            Sort Bits
          </button>
        </section>

        <section className="tabs-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === "custom" ? "active" : ""}`}
              onClick={() => setActiveTab("custom")}
            >
              Custom
            </button>
            <button 
              className={`tab ${activeTab === "primitives" ? "active" : ""}`}
              onClick={() => setActiveTab("primitives")}
            >
              Primitives
            </button>
            <button 
              className={`tab ${activeTab === "special" ? "active" : ""}`}
              onClick={() => setActiveTab("special")}
            >
              Special Values
            </button>
            <button 
              className={`tab ${activeTab === "collections" ? "active" : ""}`}
              onClick={() => setActiveTab("collections")}
            >
              Collections
            </button>
            <button 
              className={`tab ${activeTab === "builtins" ? "active" : ""}`}
              onClick={() => setActiveTab("builtins")}
            >
              Built-ins
            </button>
            <button 
              className={`tab ${activeTab === "complex" ? "active" : ""}`}
              onClick={() => setActiveTab("complex")}
            >
              Complex
            </button>
          </div>

          <section className="samples-section">
            {activeTab === "custom" && (
              <div>
                <h3>Use the textarea above to test custom inputs</h3>
              </div>
            )}
            {activeTab === "primitives" && (
              <div>
                <h3>Primitive Types</h3>
                <p>Test individual JavaScript primitives</p>
                {renderSampleButtons(primitives)}
              </div>
            )}
            {activeTab === "special" && (
              <div>
                <h3>Special Values</h3>
                <p>Test edge cases like null, undefined, NaN, Infinity</p>
                {renderSampleButtons(specialValues)}
              </div>
            )}
            {activeTab === "collections" && (
              <div>
                <h3>Collections</h3>
                <p>Test arrays, objects, and nested structures</p>
                {renderSampleButtons(collections)}
              </div>
            )}
            {activeTab === "builtins" && (
              <div>
                <h3>Built-in Types</h3>
                <p>Test Date, RegExp, Error, and other built-in objects</p>
                {renderSampleButtons(builtins)}
              </div>
            )}
            {activeTab === "complex" && (
              <div>
                <h3>Complex Examples</h3>
                <p>Real-world test scenarios with mixed types</p>
                {renderSampleButtons(complex)}
              </div>
            )}
          </section>
        </section>
      </div>

      <div className="right-column">
        <section className="output-section">
          <h2>Results</h2>
          {output ? (
            <div className="results-container">
              {output.error ? (
                <div className="output-box error">Error: {output.error}</div>
              ) : (
                <div className="result-column">
                  <h3>Original Input</h3>
                  <pre className="output-box input-box">
                    {formatBigIntSafe(output.input)}
                  </pre>
                  <h3>Binary Bit Strings</h3>
                  <p className="column-hint">returnOriginal: false</p>
                  <p className="column-hint-sub">Raw bit data - 0s and 1s normalized</p>
                  <pre className="output-box binary-box">
                    {formatBinaryOutput(output.binaryStrings)}
                  </pre>
                  <p className="column-hint">returnOriginal: true</p>
                  <p className="column-hint-sub">Original data sorted by bit count</p>
                  <pre className="output-box original-box">
                    {formatOriginalOutput(output.originalReordered)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="output-box empty">Run a test to see results...</div>
          )}
        </section>
      </div>

      <div className="docs-section">
        <section className="info-section">
          <h3>How It Works</h3>
          <ol>
            <li><strong>Convert:</strong> Any input is converted to binary (64-bit for numbers, UTF-8 for strings, etc.)</li>
            <li><strong>Count:</strong> All bits are counted; returns "0"*zeros + "1"*ones</li>
            <li><strong>Sort:</strong> Collections sorted by: bit count (primary), lexicographic (secondary), original order (tertiary)</li>
            <li><strong>Return:</strong> Either bit strings (default) or original values reordered (with returnOriginal: true)</li>
          </ol>
        </section>
      </div>
      </div>
    </div>
  );
}
