## <b>Checkpoint</b>

### Provision cloud instances and setup monitoring infrastructure. (Owner: Archit Kwatra)

* Provision instances for your target infrastructure on a cloud provide  <b>Complete</b>
* Generate an inventory.ini with your cloud resources  <b>Complete</b>
  
### Implement deployment to cloud instances.(Owner: Santosh Pisapati)

* Deploy checkbox.io to your production environment provided in inventory.ini <b>In Progress</b>
* Deploy iTrust to your production environment provided in inventory.ini <b>Not Started</b>

### Implement canary analysis (checkbox.io preview microservice) (Owner: Lokesh Reddy)
   * Construct a computing environment with three VMs as shown in diagram (locally)  <b>Completed</b>
   * Generate load to the proxy server by requesting the /preview service.  <b>Completed</b>
   * For the first 1 minute, send the load to the blue instance, collect health metrics. <b>In Progress</b>
   * Next, send traffic to the green instance for 1 minute, collect health metrics. <b>Not Started</b>
   * Report a statistical comparision between health values and compute a canary score. Determine whether canary has "passed" or "failed". <b>Not Started</b>

### Bonus: Monitoring Dashboard (Owner: All)
  * Create a monitor-setup -i inventory.ini command that deploys a monitoring dashboard <b>Not Started</b>
  * Expose the dashboard endpoint on http://<monitoring ip>/dashboard. <b>Not Started</b>
  
### Current progress
- Total Issues: 10
- Closed Issues: 2
- Open Issues: 8

![](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-10/blob/master/kanban3.PNG)<br>
