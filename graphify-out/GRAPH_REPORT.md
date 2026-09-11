# Graph Report - learn-go-visually  (2026-09-11)

## Corpus Check
- 21 files · ~72,711 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 200 edges · 18 communities (11 shown, 2 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- gRPC & Protocol Buffers
- Basics Visualizer Scripts
- Core Interfaces & Error Handling
- Project Architecture & Standards
- Algorithms & Data Structures
- Concurrency & Context Channels
- Concurrency Visualizer Engine
- Go Language Fundamentals
- Kubernetes Operators & CRDs
- Generics & Advanced Testing
- Concurrency Design Patterns
- Core Concepts Visualizer Scripts
- Kubernetes Operator Visualizers

## God Nodes (most connected - your core abstractions)
1. `Project Guide: Learn Go Visually` - 13 edges
2. `Home Page & Topic Roadmap` - 11 edges
3. `Learn Go Visually README` - 10 edges
4. `Basics: Hello Go, Variables, Control Flow & Functions` - 9 edges
5. `Core: Structs, Slices, Maps, Interfaces & Errors` - 8 edges
6. `Kubernetes Operator Pattern` - 8 edges
7. `Channels: CSP Shared-Memory Alternative` - 7 edges
8. `Advanced: Generics, Context & Testing` - 7 edges
9. `REST Architecture & Constraints` - 6 edges
10. `Concurrency Patterns Interview Track` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Finalizers for External Resource Cleanup` --semantically_similar_to--> `Defer Statement (LIFO Order)`  [INFERRED] [semantically similar]
  operators.html → basics.html
- `Slice Header (Data Pointer, Length, Capacity)` --semantically_similar_to--> `Stack and Queue Implementations via Slices`  [INFERRED] [semantically similar]
  core.html → coding-interview.html
- `Error Wrapping with %w, errors.Is and errors.As` --semantically_similar_to--> `Structured HTTP Error Handling`  [INFERRED] [semantically similar]
  core.html → rest-api.html
- `Bounded Worker Pool Pattern` --semantically_similar_to--> `Buffered Channels (Asynchronous Queue)`  [INFERRED] [semantically similar]
  coding-interview.html → concurrency.html
- `Done Channel Shutdown Broadcast` --semantically_similar_to--> `Hierarchical Context Cancellation Trees`  [INFERRED] [semantically similar]
  concurrency.html → advanced.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Channel Concurrency Ecosystem and Pipeline Patterns** — concurrency_channels, concurrency_unbuffered_channels, concurrency_buffered_channels, concurrency_select_statement, coding_interview_worker_pool, coding_interview_fan_in_fan_out [INFERRED 0.85]
- **Kubernetes Operator Lifecycle, Reconciler and Resource Teardown** — operators_operator_pattern, operators_crd_design, operators_reconcile_loop, operators_owner_references, operators_finalizers [EXTRACTED 1.00]
- **Distributed Service API Patterns (REST vs gRPC)** — rest_api_rest_architecture, rest_api_gin_engine, grpc_api_what_is_grpc, grpc_api_protocol_buffers, grpc_api_streaming_modes [INFERRED 0.85]

## Communities (18 total, 2 thin omitted)

### Community 0 - "gRPC & Protocol Buffers"
Cohesion: 0.11
Nodes (20): gRPC Client Stubs & Connection Management, gRPC Interview Questions and Answers, Building gRPC Services in Go, Protocol Buffers (Proto3) Serialization, gRPC Server Construction in Go, Protobuf Service Interface Definition, gRPC Streaming Modes (Unary, Client, Server, Bidirectional), gRPC Framework Architecture (+12 more)

### Community 1 - "Basics Visualizer Scripts"
Cohesion: 0.16
Nodes (7): initDeferStackViz(), render(), initFlowViz(), initLoopViz(), initRangeDecompViz(), initScopeShadowViz(), initTypeViz()

### Community 2 - "Core Interfaces & Error Handling"
Cohesion: 0.12
Nodes (16): Closures and Lexical Scope Capture, First-Class and Anonymous Functions, Multiple Return Values & (result, error) Idiom, The Error Interface & Sentinel Errors, Error Wrapping with %w, errors.Is and errors.As, Implicit Interface Implementation, Core Go Interview Questions and Answers, The Nil Interface Gotcha (Typed Nil vs Untyped Nil) (+8 more)

### Community 3 - "Project Architecture & Standards"
Cohesion: 0.16
Nodes (15): ES5-Compatible JavaScript Style Convention, Interactive Visuals Data-Viz Pattern, No Run Button Browser Security Decision, Project Guide: Learn Go Visually, Zero-Build Static Site Architecture, Multi-Tier Verification Standards, Concurrency Interview Questions and Answers, Concurrency: Goroutines, Channels & Buffers (+7 more)

### Community 4 - "Algorithms & Data Structures"
Cohesion: 0.13
Nodes (14): Algorithms & Strings Interview Track, Binary Search Algorithm, Data Structures Interview Track, Linked List Implementations & Algorithms, LRU Cache (Map + Doubly Linked List), Coding Interview Questions & Solutions, Stack and Queue Implementations via Slices, Binary Search Tree & Graph Traversals (BFS/DFS) (+6 more)

### Community 5 - "Concurrency & Context Channels"
Cohesion: 0.14
Nodes (14): Context (context.Context) Architecture, Hierarchical Context Cancellation Trees, Context WithValue Request-Scoped Data, Channel Directional Constraints (chan<- and <-chan), Channels: CSP Shared-Memory Alternative, Channel Closing Semantics, Done Channel Shutdown Broadcast, For-Range Channel Iteration (+6 more)

### Community 6 - "Concurrency Visualizer Engine"
Cohesion: 0.18
Nodes (8): initBufferedViz(), render(), initGoroutineViz(), panelLanes(), resetPanel(), runPanel(), initSelectViz(), initUnbufferedViz()

### Community 7 - "Go Language Fundamentals"
Cohesion: 0.17
Nodes (12): Untyped and Typed Constants, Explicit Type Conversion (No Implicit Casting), Unified For Loop, For-Range Loop & Go 1.22 Variable Semantics, If with Short Initialization Statement, Basics Interview Questions and Answers, Main Package and Entrypoint, Basics: Hello Go, Variables, Control Flow & Functions (+4 more)

### Community 8 - "Kubernetes Operators & CRDs"
Cohesion: 0.24
Nodes (11): Defer Statement (LIFO Order), Controller-Runtime vs Client-Go Comparison, Custom Resource Definition (CRD) Architecture, Integration Testing with envtest, Finalizers for External Resource Cleanup, Key Enqueue Decoupling Pattern, Controller Leader Election, Kubernetes Operator Pattern (+3 more)

### Community 9 - "Generics & Advanced Testing"
Cohesion: 0.22
Nodes (9): Benchmarking Framework (testing.B), The comparable Built-in Constraint, Native Fuzz Testing (testing.F), Generics and Type Parameters, Advanced Interview Questions and Answers, Advanced: Generics, Context & Testing, Table-Driven Testing and Subtests (t.Run), Standard Library testing Package (+1 more)

### Community 10 - "Concurrency Design Patterns"
Cohesion: 0.29
Nodes (7): Concurrency Patterns Interview Track, Fan-In and Fan-Out Concurrency Patterns, Channel Pipeline Pattern, Token Bucket Rate Limiter with time.Ticker, Go Sync Primitives (RWMutex, Cond, Atomic, ErrGroup), Bounded Worker Pool Pattern, Buffered Channels (Asynchronous Queue)

## Knowledge Gaps
- **33 isolated node(s):** `Interactive Visuals Data-Viz Pattern`, `Curriculum Scope and Structure`, `Future Live Execution Architecture (Cloudflare Worker & Yaegi)`, `Applied Go Learning Track`, `Interview Prep Learning Track` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 106 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Project Guide: Learn Go Visually` connect `Project Architecture & Standards` to `gRPC & Protocol Buffers`, `Core Interfaces & Error Handling`, `Algorithms & Data Structures`, `Go Language Fundamentals`, `Generics & Advanced Testing`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `Home Page & Topic Roadmap` connect `gRPC & Protocol Buffers` to `Core Interfaces & Error Handling`, `Project Architecture & Standards`, `Algorithms & Data Structures`, `Go Language Fundamentals`, `Generics & Advanced Testing`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `Basics: Hello Go, Variables, Control Flow & Functions` connect `Go Language Fundamentals` to `Kubernetes Operators & CRDs`, `gRPC & Protocol Buffers`, `Core Interfaces & Error Handling`, `Project Architecture & Standards`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `Interactive Visuals Data-Viz Pattern`, `Curriculum Scope and Structure`, `Future Live Execution Architecture (Cloudflare Worker & Yaegi)` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `gRPC & Protocol Buffers` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Core Interfaces & Error Handling` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Algorithms & Data Structures` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._