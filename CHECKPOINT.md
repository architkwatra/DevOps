## <b>Checkpoint</b>

* Store `gh-password` in Jenkins credentials manager. <b>In Progress</b>
* The command `useful-tests` should be run on the config-srv. <b>Not Started</b>

### 🛠️Automatically configure a build environment and build job (iTrust) (Owner: Archit Kwatra)

* Create a build environment for [iTrust2-v8](https://github.ncsu.edu/engr-csc326-staff/iTrust2-v8), an "enterprise" Java system. <b>In Progress</b>
* Checkstyle and code coverage <b>In Progress</b>

  
### 🧪 Implement a test suite analysis for detecting useful tests (Owner: Santosh Pisapati)

* Implement a fuzzer that performs the following operations <b>Implemented</b> (Issue [#68](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-10/issues/68))

### Test prioritization analysis (Owner: Santosh Pisapati)
   * Generate random changes with your code fuzzer.  <b>Not Started</b>
   * If your changes would result in compile failures, discard changes and restart process.  <b>Not Started</b>
   * Run units tests with `mvn clean test`.  <b>Not Started</b>
   * Record which test cases have failed, and which have passed.  <b>Not Started</b>
   * Reset code, *drop database*, discarding your changes.  <b>Not Started</b>
   * discard changes that would result in compile failures.  <b>Not Started</b>
   * 1000 test suite runs to perform your test suite analysis.  <b>Not Started</b>
   * calculate failure/passed results for *individual test cases and not *test classes*.  <b>Not Started</b>

### ✅ Implement a static analysis for checkbox.io (Owner: Lokesh Reddy)
   * Long method: Detect long methods (>100 LOC). <b>In Progress</b>
   * Message Chains: Detect message chains (> 10 chains) <b>In Progress</b>
   * MaxNestingDepth: Count max depth of if statements in a function (> 5) <b>In Progress</b>
   * Build Log Report <b>Not Started</b>
   * Run the analysis on all javascript files inside of the server-side/ directory  <b>Not Started</b>
   * Report **all violations** discovered in build log  <b>Not Started</b>
   * Fail the build if *any* of these metrics exceed the given threshold.  <b>Not Started</b>

### Current progress
- Total Issues: 18
- Closed Issues: 1
- Open Issues: 17

![](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-10/blob/master/kanban2.PNG)<br>
