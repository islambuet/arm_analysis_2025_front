<template>
  <div id="accordion">
    <div class="card d-print-none">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" href="#label_task">{{labels.get('label_task')}} </a>
      </div>
      <div id="label_task" class="collapse show" v-if="item.exists">
        <form id="formSearch">
          <div class="row mt-2">
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields1" />
            </div>
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields2" />
            </div>
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields3" />
            </div>
          </div>
        </form>
        <div class="row">
          <div class="col-12 text-center">
            <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="search"><i class="feather icon-save"></i> {{labels.get('label_search')}}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card d-print-none" v-if="taskData.permissions.action_8">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" href="#label_action_8">{{labels.get('action_8')}} </a>
      </div>
      <div id="label_action_8" class="collapse" v-if="item.exists">
        <div class="row card-body">
          <template v-for="column in taskData.columns.selectable">
            <div class="col-sm-6 col-md-3">
              <label><input type="checkbox" :value="column" :checked="taskData.columns.hidden.indexOf(column)<0" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="exportCsv"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
      <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="showHtmlContentInNewWindow"><i class="feather icon-maximize-2"></i> {{labels.get('action_show_in_new_window')}}</button>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <table id="table_report" :style="'width: '+table_width+'px'" class="table table-bordered sticky">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in taskData.columns.all">
            <th :style="'width: '+(column.width?column.width:150)+'px;'" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['season','target_quantity','sales_quantity','balance_quantity','stock_open_quantity','stock_purchase_quantity','stock_sales_quantity','stock_end_quantity'].indexOf(column.group) != -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
                <template v-if="index==1">
                  <template v-if="(['target_quantity','sales_quantity','balance_quantity','stock_open_quantity','stock_purchase_quantity','stock_sales_quantity','stock_end_quantity'].indexOf(column.group) != -1)">{{ row[column.key]?(row[column.key]).toFixed(3):'' }}</template>
                  <template v-else-if="(['season'].indexOf(column.group) != -1)">
                    <div :style="'background-color: '+(type_months_color_object[row[column.key]]?type_months_color_object[row[column.key]]['color']:'#000000')">
                      &nbsp;{{ row[column.key] }}
                    </div>
                  </template>
                  <template v-else>{{ row[column.key] }}</template>
                </template>
                <template v-else>&nbsp</template>
              </td>
            </template>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'
    import {inject, reactive, ref} from 'vue'
    import {useRouter} from 'vue-router';
    import axios from "axios";
    import InputTemplate from '@/components/InputTemplate.vue';
    import ColumnControl from '@/components/ColumnControl.vue';
    import toastFunctions from "@/assets/toastFunctions";

    const router =useRouter()
    let taskData = inject('taskData')
    let show_report=ref(false)
    let table_width=ref(0)
    let show_column_controls=ref(false)
    let item=reactive({
      exists:false,
      inputFields1:{},
      inputFields2:{},
      inputFields3:{},
      data:{
      }
    })

    let crops_object={};
    for(let i in taskData.crops){
      crops_object[taskData.crops[i]['id']]=taskData.crops[i];
    }
    let crop_types_object={};
    for(let i in taskData.crop_types){
      crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
    }
    let varieties_object={};
    for(let i in taskData.varieties){
      varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
    }
    let location_parts_object={};
    for(let i in taskData.location_parts){
      let part_id=taskData.location_parts[i]['id'];
      location_parts_object[part_id]=taskData.location_parts[i];
    }
    let location_areas_object={};
    for(let i in taskData.location_areas){
      let area_id=taskData.location_areas[i]['id'];
      location_areas_object[area_id]=taskData.location_areas[i];
    }
    let location_territories_object={};
    for(let i in taskData.location_territories){
      let territory_id=taskData.location_territories[i]['id'];
      location_territories_object[territory_id]=taskData.location_territories[i];
    }
    let distributors_object={};
    for(let i in taskData.distributors){
      let distributor_id=taskData.distributors[i]['id'];
      distributors_object[distributor_id]=taskData.distributors[i];
    }
    let type_months_color_object={};
    for(let i in taskData.type_months_color){
      type_months_color_object[taskData.type_months_color[i]['value']]=taskData.type_months_color[i];
    }

    const setInputFields=async ()=>{
      item.inputFields1= {};
      item.inputFields2= {};
      item.inputFields3= {};
      await systemFunctions.delay(1);
      let inputFields={}
      let key='fiscal_year';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(globalVariables.current_fiscal_year-globalVariables.sales_starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}}),
        default:globalVariables.current_fiscal_year,
        mandatory:true,
        noselect:true,
      };
      key='month';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}}),
        default:(globalVariables.current_month==1?12:globalVariables.current_month-1),
        mandatory:true,
        noselect:true,
      };
      key='month_status';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.type_months_color.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.value.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false,
        noselect:true,
      };
      inputFields[key]['options'].unshift({value:-1,label:labels.get('label_select')})//to change select value different

      key='stock_status';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[{label:"All Variety",value:'All'},{label:"Opening Stock",value:'open'},{label:"End Stock",value:'end'},{label:"Open or End Stock",value:'open_end'}],
        default:'end',
        mandatory:true,
        noselect:true,
      };
      item.inputFields1=inputFields;
      //inputFields2
      inputFields={}

      key='part_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.location_parts.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.part_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.part_id,
          mandatory:true
        };
        key='part_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_parts_object[taskData.user_locations.part_id]['name'],
          mandatory:false
        };
      }
      key='area_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.part_id>0)?taskData.location_areas.filter((temp)=>{ if((temp.part_id==taskData.user_locations.part_id)&&(temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.area_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.area_id,
          mandatory:true
        };
        key='area_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_areas_object[taskData.user_locations.area_id]['name'],
          mandatory:false
        };
      }
      key='territory_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.area_id>0)?taskData.location_territories.filter((temp)=>{ if((temp.area_id==taskData.user_locations.area_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.territory_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.territory_id,
          mandatory:true
        };
        key='territory_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_territories_object[taskData.user_locations.territory_id]['name'],
          mandatory:false
        };
      }
      key='distributor_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.territory_id>0)?taskData.distributors.filter((temp)=>{ if((temp.territory_id==taskData.user_locations.territory_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };


      item.inputFields2=inputFields;
      //inputFields3
      inputFields={}
      key='crop_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.crops.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false
      };
      key='crop_type_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:false
      };
      key='variety_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:true
      };
      key='status';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[{label:"All",value:'All'},{label:"Active",value:'Active'},{label:"In-Active",value:'In-Active'}],
        default:'Active',
        mandatory:true,
        noselect:true,
      };


      item.inputFields3=inputFields;



      await systemFunctions.delay(1);
      item.exists=true;
      await systemFunctions.delay(1);
      $('.input_container div').removeClass('col-lg-4')//to fix size

    }
    const search=async ()=>{
      show_report.value=false;
      let options={};
      $('#formSearch :input').each(function() {
        options[$(this).attr('id')]=$(this).val();
      });
      let formData=new FormData(document.getElementById('formSearch'))
      await axios.post(taskData.api_url+'/get-items',formData).then((res)=>{
        if (res.data.error == "") {
          taskData.itemsFiltered=[];
          let columns_all=[];
          let rows={};
          let rows_array=[];

          let type_months=res.data.type_months;

          columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
          columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
          columns_all.push({'group':'variety_name','key':'variety_name','label':labels.get('label_variety_name')})
          columns_all.push({'group':'season','key':'season','label':labels.get('label_season'),'width':70})
          columns_all.push({'group':'target_quantity','key':'target_quantity','label':labels.get('label_target_quantity'),'width':120})
          columns_all.push({'group':'sales_quantity','key':'sales_quantity','label':labels.get('label_sales_quantity'),'width':120})
          columns_all.push({'group':'balance_quantity','key':'balance_quantity','label':labels.get('label_balance_quantity')})
          columns_all.push({'group':'stock_open_quantity','key':'stock_open_quantity','label':labels.get('label_stock_open_quantity'),'width':120})
          columns_all.push({'group':'stock_purchase_quantity','key':'stock_purchase_quantity','label':labels.get('label_stock_purchase_quantity'),'width':120})
          columns_all.push({'group':'stock_sales_quantity','key':'stock_sales_quantity','label':labels.get('label_stock_sales_quantity'),'width':120})
          columns_all.push({'group':'stock_end_quantity','key':'stock_end_quantity','label':labels.get('label_stock_end_quantity'),'width':120})
          for(let i in taskData.varieties){
            let variety=taskData.varieties[i];
            if(variety['whose']!='ARM')
              continue;
            if(options['status']!='All' && variety['status']!=options['status'])
              continue;
            if(options['month_status']>-1 && !type_months[variety['crop_type_id']])
              continue;
            if(options['stock_status']=='open' && !(res.data.stock_open_quantity[variety['id']]))
              continue;
            else if(options['stock_status']=='end' && !(res.data.stock_end_quantity[variety['id']]))
              continue;
            else if(options['stock_status']=='open_end' && !(res.data.stock_end_quantity[variety['id']] || res.data.stock_open_quantity[variety['id']]))
              continue;

            if(options['crop_id']>0){
              if(options['crop_type_id']>0){
                if(options['variety_id']>0){
                  if(options['variety_id']!=variety['id']){
                    continue;
                  }
                }
                else if(options['crop_type_id']!=variety['crop_type_id']){
                  continue;
                }
              }
              else if(options['crop_id']!=variety['crop_id']){
                continue;
              }
            }
            rows[variety['id']]={}
            rows[variety['id']]['id']=variety['id'];
            rows[variety['id']]['num_rows']=1;
            rows[variety['id']]['crop_name']=variety['crop_name'];
            rows[variety['id']]['type_name']=variety['type_name'];
            rows[variety['id']]['variety_name']=variety['name'];
            rows[variety['id']]['season']=type_months[variety['crop_type_id']]?type_months[variety['crop_type_id']]['month_'+options['month']]:'-1'
            rows[variety['id']]['target_quantity']=0;
            rows[variety['id']]['sales_quantity']=0;
            rows[variety['id']]['balance_quantity']=0;
            rows[variety['id']]['stock_open_quantity']=0;
            rows[variety['id']]['stock_purchase_quantity']=0;
            rows[variety['id']]['stock_sales_quantity']=0;
            rows[variety['id']]['stock_end_quantity']=0;
            rows_array.push(rows[variety['id']])//for ordering
          }

          for(let variety_id in res.data.target){
            if(rows[variety_id]){
              rows[variety_id]['target_quantity']=(+res.data.target[variety_id])
            }
          }
          for(let i in res.data.sales){
            let datum=res.data.sales[i];
            if(rows[datum['variety_id']]){
              rows[datum['variety_id']]['sales_quantity']=(+datum['quantity'])
            }
          }
          for(let variety_id in res.data.stock_open_quantity){
            if(rows[variety_id]){
              rows[variety_id]['stock_open_quantity']=(+res.data.stock_open_quantity[variety_id])
            }
          }
          for(let variety_id in res.data.stock_end_quantity){
            if(rows[variety_id]){
              rows[variety_id]['stock_end_quantity']=(+res.data.stock_end_quantity[variety_id])
            }
          }
          for(let i in res.data.purchase_month){
            let datum=res.data.purchase_month[i];
            if(rows[datum['variety_id']]){
              rows[datum['variety_id']]['stock_purchase_quantity']=(+datum['quantity'])
            }
          }

          //For ordering
          for(let i in rows_array){
            let row=rows[rows_array[i]['id']];
            if(row['target_quantity']>0){
              row['balance_quantity']=row['target_quantity']-row['sales_quantity']
            }
            row['stock_sales_quantity']=row['stock_open_quantity']+row['stock_purchase_quantity']-row['stock_end_quantity']
            rows_array[i]=row;
          }
          taskData.itemsFiltered=rows_array;
          taskData.columns.all=columns_all;
          calculateTableWidth();
          show_report.value=true;
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });
    }
    const exportCsv=async ()=>{
      systemFunctions.exportCsvFromHtmlTable('#table_report',labels.get('label_task'))
    }
    const showHtmlContentInNewWindow=async ()=>{
      systemFunctions.showHtmlContentInNewWindow('<table>'+$('#table_report').html()+'</table>',labels.get('label_task'))

    }
    const toggleReportControlColumns=(event)=>{
      //show_report.value=false;
      let key=event.target .value;
      if(event.target .checked){
        taskData.columns.hidden=taskData.columns.hidden.filter(function(value) {return value !== key});
      }
      else{
        taskData.columns.hidden.push(key);
      }
      calculateTableWidth();
    }
    const calculateTableWidth=()=>{
      table_width.value=systemFunctions.calculateReportTableWidth(taskData.columns);
    }
    setInputFields();
    $(document).ready(async function()
    {
      taskData.columns.selectable=['season','target_quantity','sales_quantity','balance_quantity','stock_open_quantity','stock_purchase_quantity','stock_sales_quantity','stock_end_quantity'];
      taskData.columns.hidden=[];
      $(document).off("change", "#fiscal_year");
      $(document).off("change", "#month");

      $(document).off("change", "#crop_id");
      $(document).on("change",'#crop_id',async function()
      {
        let crop_id=$(this).val();
        let key='crop_type_id';
        item.inputFields3[key].options=taskData.crop_types.filter((temp)=>{ if((temp.crop_id==crop_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='variety_id';
        item.inputFields3[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#crop_type_id");
      $(document).on("change",'#crop_type_id',async function()
      {
        let crop_type_id=$(this).val();
        let key='variety_id';
        item.inputFields3[key].options=taskData.varieties.filter((temp)=>{ if((temp.crop_type_id==crop_type_id) && (temp.whose=='ARM')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })
      $(document).off("change", "#variety_id");



      $(document).off("change", "#part_id");
      $(document).on("change",'#part_id',async function()
      {
        let part_id=$(this).val();
        let key='area_id';
        item.inputFields2[key].options=taskData.location_areas.filter((temp)=>{ if((temp.part_id==part_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='territory_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
        key='distributor_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#area_id");
      $(document).on("change",'#area_id',async function()
      {
        let area_id=$(this).val();
        let key='territory_id';
        item.inputFields2[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='distributor_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#territory_id");
      $(document).on("change",'#territory_id',async function()
      {
        let territory_id=$(this).val();
        let key='distributor_id';
        item.inputFields2[key].options=taskData.distributors.filter((temp)=>{ if((temp.territory_id==territory_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })
      $(document).off("change", "#distributor_id");

    });

</script>


<style scoped>

/* To show borders. overwrite bootstarp css */
table.sticky {
  border-collapse: separate;
  border-spacing: 0;
}
table.sticky >thead th{
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1030;
  background:#f5f5f5;
  border-width: 1px;
  width: 100px;
}
table.sticky > thead > tr > th:nth-child(1){
  left: 0;
  z-index: 1040;
}
table.sticky > thead > tr > th:nth-child(2){
  left: 150px;
  z-index: 1040;
}

table.sticky > tbody > tr > td:nth-child(1){
  position: sticky;
  position: -webkit-sticky;
  left: 0;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}

table.sticky > tbody > tr > td:nth-child(2){
  position: sticky;
  position: -webkit-sticky;
  left: 150px;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}
</style>