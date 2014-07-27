TRANSCRIPTS EDITOR
------------------

This module adds editing functionality to the Transcripts module, enabling users
with permissions to edit transcripts in-situ.


INSTALLATION
------------

Requires: Transcripts, Transcripts Node, and Flag

Install and enable the Transcripts Editor module as you would any other Drupal 
module.


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
abandon all changes made online and regenerate TCUs from the originally 
uploaded transcript.


<< Last modified, 27 July 2014 >>
