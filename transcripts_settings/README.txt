This module packages together default settings from the Transcripts module as
a feature that can be installed on any Drupal 7 website. In addition, the module
wraps the feature and its admin interface up into a "space". This allows
Transcripts settings to be different for different portions of a site. For
example, using spaces_og, different groups can have different configuration
settings.


INSTALLATION
------------

Required: Drupal 7, CTools, Strongarm, Transcripts

Optional: Spaces, Spaces OG, Spaces User, etc.

The Transcripts Settings module comes with the Transcripts module and can be
found and enabled in the module list under the header 'Pinedrop Transcripts'.


USING WITH SPACES OG
--------------------

* Set PURL for group


2. Disable PURL behavior for menus as necessary

When using PURL with Spaces, page links are normally rewritten to contain the
active persistent url elements. In other words, in a space activated by the 
PURL prefix "doughnuts", the menu link "members" would be rewritten as 
"doughnuts/members". To disable this behavior, go to 

admin/structure/menu/manage/MENU-NAME/edit

and choose 'Discard' under Persistent URL Behavior.


VERSION HISTORY
---------------
version 0.1 (28 February 2012)
