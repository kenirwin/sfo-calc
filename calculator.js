$(document).ready(function () {
  // LogParams();
  $.when(
    $.ajax({
      url: './recipes.json',
      type: 'GET',
      dataType: 'json',
      success: function (fileContents) {
        recipes = fileContents;
      },
      async: false,
    })
  ).done(function () {
    // console.log(recipes);
    CreateForm(recipes);
    CalculateIngredients(recipes);
  });
});

// function LogParams() {
//   // get url params
//   let urlParams = new URLSearchParams(window.location.search);
//   urlParams.forEach(function (value, key) {
//     console.log(key, value);
//   });
//   if (urlParams.has('recipe0')) {
//     console.log('test output');
//   }
// }

function CreateForm(recipes) {
  let urlParams = new URLSearchParams(window.location.search);
  let form = $('#desired_products');
  var i = 0;
  let divs = [];
  for (var key in recipes) {
    let recipeName = recipes[key]['Recipe'];
    let itemId = 'recipe' + i;
    let value = 0;
    if (urlParams.has(itemId)) {
      value = urlParams.get(itemId); // get value from url if it exists
    }
    let div = $('<div></div>')
      .append($('<label></label>').attr('for', itemId).text(recipeName))
      .append(
        $('<input></input>')
          .attr('type', 'number')
          .attr('name', recipeName)
          .attr('value', value)
          .attr('id', itemId)
      );
    form.html('<h1>Desired Products</h1>');
    divs.push(div);
    i++;
  }
  form.append(divs);
  form.append(
    $('<button></button>')
      .attr('type', 'button')
      .attr('id', 'clear')
      .text('Clear Form')
      .addClass('btn btn-primary')
  );
  $('input').bind('change', function () {
    CalculateIngredients(recipes);
  });
  $('#clear').click(function () {
    $('input[type="number"]').val(0);
    $('#needed_ingredients').html('');
  });
}

function CalculateIngredients(recipes) {
  formValues = $('#desired_products').serializeArray();
  // console.log(formValues)
  ingredients = [];
  totalCases = 0;
  let ingredientsToOrder = [];
  formValues.forEach(function (item) {
    if (item.value > 0) {
      recipe = recipes.find((recipe) => recipe.Recipe === item.name);
      // console.log(recipe);
      let ingredients = Object.keys(recipe);
      ingredients.splice('Recipe', 1); // Recipe is not an ingredient
      ingredients.splice('id', 1); // id is not an ingredient
      ingredients.forEach(function (ingredient) {
        let itemClass;
        if (ingredient.match(/Mild/i)) {
          itemClass = 'mild';
        } else if (ingredient.match(/Med/i)) {
          itemClass = 'medium';
        } else if (ingredient.match(/Xtra/i)) {
          itemClass = 'xtra';
        } else if (ingredient.match(/Hot/i)) {
          itemClass = 'hot';
        }
        let ingredientToOrder = ingredientsToOrder.find(
          (iToO) => iToO.Item === ingredient
        );
        if (ingredientToOrder === undefined) {
          ingredientsToOrder.push({
            Item: ingredient,
            Quantity: recipe[ingredient] * item.value,
            Class: itemClass,
          });
        } else {
          ingredientToOrder.Quantity += recipe[ingredient] * item.value;
        }
        totalCases += recipe[ingredient] * item.value;
      });
    }
  });
  displayResults(ingredientsToOrder, totalCases);
  displayLink();
}

function displayResults(ingredientsToOrder) {
  let rows = [];
  ingredientsToOrder.forEach(function (ingredient) {
    let name = $('<td></td>').text(ingredient.Item);
    let quantity = $('<td></td>').text(ingredient.Quantity);
    let temp = $('<tr></tr>')
      .addClass(ingredient.Class)
      .append(name)
      .append(quantity);
    rows.push(temp);
  });
  // console.log(rows);
  let thead = $('<thead></thead>');
  thead.append('<tr><th>Item</th><th>Cases</th></tr>');
  let tbody = $('<tbody></tbody>');
  tbody.append(rows);
  $('#needed_ingredients').html('');
  $('#needed_ingredients').append(thead);
  $('#needed_ingredients').append(tbody);
  let tfooter = $('<tfoot></tfoot>');
  tfooter.append(
    $('<tr></tr>')
      .addClass('table-dark')
      .append($('<td></td>').text('Total Cases'))
      .append($('<td></td>').text(totalCases))
  );
  $('#needed_ingredients').append(tfooter);
  // $('#needed_ingredients').html(JSON.stringify(ingredientsToOrder));
}

function displayLink() {
  let link = $('#link-to-page');
  let linkableParams = new URLSearchParams();
  $('#desired_products input[type="number"').each(function () {
    if ($(this).val() > 0) {
      // console.log($(this).attr('id'), $(this).val());
      linkableParams.set($(this).attr('id'), $(this).val());
      // link.attr('href', '?' + $(this).attr('id') + '=' + $(this).val());
    }
  });
  link.attr('href', '?' + linkableParams.toString());
}
