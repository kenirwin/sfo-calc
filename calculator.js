$(document).ready(function () {
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
  });
});

function CreateForm(recipes) {
  let form = $('#desired_products');
  var i = 0;
  let divs = [];
  for (var key in recipes) {
    let recipeName = recipes[key]['Recipe'];
    let itemId = 'recipe' + i;
    let div = $('<div></div>')
      .append($('<label></label>').attr('for', itemId).text(recipeName))
      .append(
        $('<input></input>')
          .attr('type', 'number')
          .attr('name', recipeName)
          .attr('value', 0)
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
