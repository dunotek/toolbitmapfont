import regex, sys
text = sys.argv[1]
def splitCharacter():
    return regex.findall(u'\\X', text)
output = splitCharacter()
result = ''
for x in output:
    if x != ' ': result += x + ' '
print(result)
# print(str)
# return str