# Trial document 
### List of headings 
- h1 
- h2
- h3
- h4
- h5
- h6

### Paragraph 

> **W.B. Yeats**

>> *I write it out in a verse –
>> MacDonagh and MacBride
>> And Connolly and Pearse
>> Now and in time to be,
>> Wherever green is worn,
>> Are changed, changed utterly:
>> A terrible beauty is born.*

#### List
1. First item
2. Second item
3. Third item
    1. Indented item
    2. Indented item
4. Fourth item


### Linking Tests
* [Internal link (General Usage)](#general-usage)
* [Another internal link](#an-image)
* [Link to another file]($$/2_linking_test_section/1_linking_test_chapter.md)
* [Heading in another file]($$/2_linking_test_section/1_linking_test_chapter.md#conclusions)
* [Link to an external website](https://github.com/)
* [External link to a section of a page](https://github.com/steviejeebies/EdgeScanDocBuilder#edgescandocbuilder)

### An image
![Shiprock]($$/1_formatting_test_section/Shiprock.png)


### Codeblock
```html
<html>
    <body>
        <something>
    </body>
<html>
```

### Codeblock With Syntax Highlighting
```python
def split_string(my_string: str, seps: list):
  items = []
  i = 0
  while i < len(my_string):
    sub = next_word_or_separator(my_string, i, seps)
    if sub[0] not in seps:
      items.append(sub) 
    i += len(sub)
  return items
split_string(my_string)  # ["Hi,", "fam!"]
```
# General Usage

The table below gives an overview of the possible actions available for an API endpoint.

| Action                                                  | HTTP Method | URI            | Response Code | Description                         | Returns                                                          |
| ------------------------------------------------------- | ----------- | -------------- | ------------- | ----------------------------------- | ---------------------------------------------------------------- |
| **List** resources                                      | GET         | /resources     | 200           | Successful query                    | A representation of a list of resources, optionally filtered     |
|                                                         |             |                | 400           | Client Error, (e.g. invalid params) | No content, or a description of the error if applicable/possible |
|                                                         |             |                | 403           | Unauthorized                        | Explanation of authorization failure                             |
| **Show** detailed information about a specific resource | GET         | /resources/:id | 200           | Successful                          | A representation of the resource with given id                   |
|                                                         |             |                | 403           | Unauthorized                        | Explanation of authorization failure                             |
|                                                         |             |                | 404           | No resource matching id             | No content                                                       |
| **Create** a new resource                               | POST        | /resources     | 200           | Successful creation of resource     | A representation of the new resource                             |
|                                                         |             |                | 400           | Client Error, (e.g. invalid params) | A description of the error(s)                                    |
|                                                         |             |                | 403           | Unauthorized                        | Explanation of authorization failure                             |
| **Update** an existing resource                         | PUT         | /resources/:id | 200           | Successful update of resource       | A representation of the new state of the resource                |
|                                                         |             |                | 400           | Client Error, (e.g. invalid params) | A description of the error(s)                                    |
|                                                         |             |                | 403           | Unauthorized                        | Explanation of authorization failure                             |
|                                                         |             |                | 404           | No resource                         | No content matching id                                           |
| **Delete** an existing resource                         | DELETE      | /resources/:id | 200           | Successful deletion of resource     | A representation of the deleted resource                         |
|                                                         |             |                | 403           | Unauthorized                        | Explanation of authorization failure                             |
|                                                         |             |                | 404           | No resource                         | No content matching id                                           |


To see the possibility, the certainty, of ruin, even at the moment of creation: it was my temperament. Those nerves had been given me as a child in Trinidad partly by our family circumstances: the half-ruined or broken-down houses we lived in, our many moves, our general uncertainty. Possibly, too, this mode of feeling went deeper, and was an ancestral inheritance, something that came with the history that had made me: not only India, with its ideas of a world outside men’s control, but also the colonial plantations or estates of Trinidad, to which my impoverished Indian ancestors had been transported in the last century – estates of which this Wiltshire estate, where I now lived, had been the apotheosis.
     Fifty years ago there would have been no room for me on the estate; even now my presence was a little unlikely. But more than accident had brought me here. Or rather, in the series of accidents that had brought me to the manor cottage, with a view of the restored church, there was a clear historical line. The migration, within the British Empire, from India to Trinidad had given me the English language as my own, and a particular kind of education. This had partly seeded my wish to be a writer in a particular mode, and had committed me to the literary career I had been following in England for twenty years.
     The history I carried with me, together with the self-awareness that had come with my education and ambition, had sent me into the world with a sense of glory dead; and in England had given me the rawest stranger’s nerves. Now ironically – or aptly – living in the grounds of this shrunken estate, going out for my walks, those nerves were soothed, and in the wild garden and orchard beside the water meadows I found a physical beauty perfectly suited to my temperament and answering, besides, every good idea I could have had, as a child in Trinidad, of the physical aspect of England.
     The estate had been enormous, I was told. It had been created in part by the wealth of empire. But then bit by bit it had been alienated. The family in its many branches flourished in other places. Here in the valley there now lived only my landlord, elderly, a bachelor, with people to look after him. Certain physical disabilities had now been added to the malaise which had befallen him years before, a malaise of which I had no precise knowledge, but interpreted as something like accidia, the monk’s torpor or disease of the Middle Ages – which was how his great security, his excessive worldly blessings, had taken him. The accidia had turned him into a recluse, accessible only to his intimate friends. So that on the manor itself, as on my walks on the down, I had a kind of solitude.
     I felt a great sympathy for my landlord. I felt I could understand his malaise; I saw it as the other side of my own. I did not think of my landlord as a failure. Words like failure and success didn’t apply. Only a grand man or a man with a grand idea of his human worth could ignore the high money value of his estate and be content to live in its semi-ruin. My meditations in the manor were not of imperial decline. Rather, I wondered at the historical chain that had brought us together – he in his house, I in his cottage, the wild garden his taste (as I was told) and also mine.

<img src="$$/1_formatting_test_section/Shiprock.png" style="float: left; margin-right: 10px;"  raw=true />


This <em>word</em> is italic.

