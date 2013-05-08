TRANSCRIPTS EDITOR
------------------

This module adds editing functionality to the Transcripts module, enabling users
with permissions to edit transcripts in-situ.


INSTALLATION
------------

Requires: Transcripts, Facet API and Facetapi Slider

Install and enable the Transcripts Editor module as you would any other Drupal 
module. Pinedrop uses a modified version of Facetapi Slider which fixes certain 
problems with the version available from drupal.org.


PERMISSIONS
-----------

To be able to edit transcripts, users need the 'Edit transcripts and timecodes'
permission. Granting this permission to a user will give her the ability to
edit any transcript belonging to a node that she can edit. She won't be able to
edit transcripts belonging to nodes that she cannot edit.

So, to make editing transcripts part of editing nodes, just give the permission
to all authenticated users. To restrict transcript editing further, create a
dedicated transcript editing role.


EDITING
-------

To edit, click on the 'Transcript' tab for the node (node/%/transcript). Click
on the 'pencil' icon under the video. (If you don't see a pencil icon, then
you don't have permission to edit this transcript.)

Once in edit mode, just click on the speaker names, tiers, and timecodes that
you want to edit. To delete a line, click on the 'x' at the top right of the
line. To insert a new line, click on the '+' below a line. New lines will 
inherit the speaker and timecodes from the previous line.

Changes are automatically saved to Drupal every ten seconds. So if you make
a change don't immediately leave or refresh the page. In general you can just
leave the editor open and all changes will be saved.

There is no 'undo' functionality. However, from the node edit page users with 
the 'Abandon transcript changes' permission can click on a link that will 
abandon all changes made online and regenerate tcus from the originally 
uploaded transcript.


CONFIGURING FACET BLOCKS
------------------------

To configure facets go to admin/config/search/apachesolr/settings, select a
search environment and click on the 'Facets' link. 

Using the Facet API module, you can limit facet queries to specific user roles. 
Do this from the 'configure dependencies' page for the facet.

Remember that enabled facets are displayed as blocks (admin/structure/block)


  Duration
    To add a facet for the "duration of the time-coded fragment", find the
    'Duration' facet and click on 'configure display'. To facet on duration 
    ranges (e.g. show me all sentences between 3 and 7 seconds in length), 
    select the 'Slider' display widget and the 'numeric_range' query type.

  Apache Solr Sorting
    If you enable this facet, you will be able to sort transcript sentences 
    by duration (ascending or descending) in addition to the built-in sorting 
    options.


VERSION HISTORY
---------------
8 May 2013. Beta 0.3 released

27 January 2012. Beta 0.2 released
