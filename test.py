
gen =  lambda x :  map(lambda y : (x,y),[1,2,3,4,5]);

add = lambda x,y : x + y;
arr = reduce(add,map(gen,[1,2,3,4,5]));

print arr;