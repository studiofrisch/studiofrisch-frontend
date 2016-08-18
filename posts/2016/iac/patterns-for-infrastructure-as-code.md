---

title: Patterns for infrastructure as code
date: 2016-05-19
draft: true
author: 1
bio: The guy behind Extreme Automation. Writes about DevOps, automation, enterprise processes, open-source, start-up life. Travels the world.
description: "One of the ways to describe software architecture is to express its configuration in executable and therefore repeatable form – infrastructure as code. Tools that are often used for this purpose (for example, Puppet, Ansible, Chef) are not utilized to their full potential. "

---

One of the ways to describe software architecture is to express its configuration in executable and therefore repeatable form – infrastructure as code. 
Tools that are often used for this purpose (for example, Puppet, Ansible, Chef) are not utilized to their full potential. 
Provided abstractions, extension points, existing modules are ignored by turning provisioning software into just a fancy file copying utility. 
Software configuration has a variety of frequently appearing patterns and ready-made abstractions to better communicate the intent of the architecture described in the form of infrastructure as code.
 
This is a collection of patterns I have come up with so far This list will be updated 
 
 
- Pattern: Reproducible Images
- Pattern: Secret Isolating
- Pattern: Encrypted Secrets
- Pattern: Infrastructure Component DSL
- Pattern: Incremental Configuration
- Pattern: Configuration Composition
- Pattern: Configuration Discovery
- Pattern: Extra-Packaging Code
- Pattern: Configuration Data Source
- Pattern: Metrics as Code
- Pattern: Control Panel as Code
- Pattern: Community Module Wrapper
- Pattern: Infrastructure Specification
- Pattern: Infrastructure Query Language
- Pattern: Automation over Documentation
- Pattern: Environment Template

- Anti-pattern: Golden Image
- Anti-pattern: Postponing Secret Isolation
- Anti-pattern: "Fancy-File-Copying"
- Anti-pattern: Data as Code
- Anti-pattern: Ignoring Styling Guidelines
- Anti-pattern: Not Treating IaC as Code
- Anti-pattern: Private Fork of a Community Module
- Anti-pattern: "Other Stuff"
- Anti-pattern: Big Ball of Mud


Let's name 

- Selecting the right abstractions for the infrastructure-as-code
- Secrets in your infrastructure-as-code
- Hidden interfaces
- Testing your infrastructure-as-code
- 

Feel free to drop me 



