This module adds editing functionality to the Transcripts module, enabling users
with permissions to edit transcripts in-situ.

INSTALLATION
------------

Requires: Transcripts, Facet API and Facetapi Slider

Install and enable the Transcripts Editor module as you would any other Drupal 
module.

Pinedrop uses a modified version of Facetapi Slider which fixes certain problems
with the version available from drupal.org.


PERMISSIONS
-----------

In order to edit transcripts, users must have the 'edit transcripts' permission.
A sensible default is for authenticated users to be granted this permission.
That way, they will be able to edit all and only those transcripts belonging to
nodes which they can edit.


CONFIGURING FACET BLOCKS
------------------------

To configure facets, go to admin/config/search/apachesolr/settings, select a
search environment and click on the "Facets" link. 

Using the Facet API module, you can limit facet queries to specific user roles. 
Do this from the "configure dependencies" page for the facet.

Remember that enabled facets are displayed as blocks (admin/structure/block).


1. Duration

To add a facet for the "duration of the time-coded fragment", find the "Duration"
facet and click on "configure display". To facet on duration ranges (e.g. show me
all sentences between 3 and 7 seconds in length), select the "Slider" display
widget and the "numeric_range" query type.

2. Apache Solr Sorting

If you enable this facet, you will be able to sort transcript sentences by
duration (ascending or descending) in addition to the built-in sorting options.


VERSION HISTORY
---------------
27 January 2012. Beta 0.2 released
