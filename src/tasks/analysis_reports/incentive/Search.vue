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
            <th style="width: 150px;" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['quantity_sales','amount_sales','unit_price','unit_price_net','quantity_target','quantity_achievable','amount_achievable','quantity_difference','achievement','quantity_incentive','amount_incentive'].indexOf(column.group) != -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
                <template v-if="index==1">
                  <template v-if="(['amount_sales','unit_price','unit_price_net','amount_achievable','achievement','amount_incentive'].indexOf(column.group) != -1)">{{ row[column.key]?row[column.key].toFixed(2):'' }}</template>
                  <template v-else-if="(['quantity_sales','quantity_target','quantity_achievable','quantity_difference','quantity_incentive'].indexOf(column.group) != -1)">{{ row[column.key]?row[column.key].toFixed(3):'' }}</template>
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
          let net_sale_adjustment=0;
          if(res.data['incentive_configurations']['NET_SALE_ADJUSTMENT']){
            net_sale_adjustment=res.data['incentive_configurations']['NET_SALE_ADJUSTMENT'];
          }
          let manager_incentive=0;
          if(options['territory_id']>0){
            if(res.data['incentive_configurations']['INCENTIVE_TERRITORY']){
              manager_incentive=res.data['incentive_configurations']['INCENTIVE_TERRITORY'];
            }
          }
          else if(options['area_id']>0){
            if(res.data['incentive_configurations']['INCENTIVE_AREA']){
              manager_incentive=res.data['incentive_configurations']['INCENTIVE_AREA'];
            }
          }
          else if(options['part_id']>0){
            if(res.data['incentive_configurations']['INCENTIVE_PART']){
              manager_incentive=res.data['incentive_configurations']['INCENTIVE_PART'];
            }
          }
          else
          {
            if(res.data['incentive_configurations']['INCENTIVE_HOM']){
              manager_incentive=res.data['incentive_configurations']['INCENTIVE_HOM'];
            }
          }
          let incentive_slabs=res.data.incentive_slabs;
          let incentive_varieties=res.data.incentive_varieties;
          taskData.itemsFiltered=[];
          let columns_all=[];
          let rows={};
          let rows_array=[];
          columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
          columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
          columns_all.push({'group':'variety_name','key':'variety_name','label':labels.get('label_variety_name')})
          columns_all.push({'group':'quantity_sales','key':'quantity_sales','label':labels.get('label_quantity_sales')})
          columns_all.push({'group':'amount_sales','key':'amount_sales','label':labels.get('label_amount_sales')})
          columns_all.push({'group':'unit_price','key':'unit_price','label':labels.get('label_unit_price')})
          columns_all.push({'group':'unit_price_net','key':'unit_price_net','label':labels.get('label_unit_price_net')+'</br>(-'+net_sale_adjustment+'%)'})
          columns_all.push({'group':'quantity_target','key':'quantity_target','label':labels.get('label_quantity')+'</br>(target)'})
          for(let i in incentive_slabs){
            columns_all.push({'group':'quantity_achievable','key':'quantity_achievable_'+incentive_slabs[i].id,'label':'Quantity Achievable</br>('+incentive_slabs[i].name+'%)'})
            columns_all.push({'group':'amount_achievable','key':'amount_achievable_'+incentive_slabs[i].id,'label':'Amount Achievable</br>('+incentive_slabs[i].name+'% * v% * '+manager_incentive+'%)'})
          }


          columns_all.push({'group':'quantity_difference','key':'quantity_difference','label':labels.get('label_quantity')+'</br>(Difference)'})
          columns_all.push({'group':'achievement','key':'achievement','label':labels.get('label_achievement')})
          columns_all.push({'group':'quantity_incentive','key':'quantity_incentive','label':labels.get('label_quantity_incentive')})
          columns_all.push({'group':'amount_incentive','key':'amount_incentive','label':labels.get('label_amount')+' incentive</br>('+manager_incentive+'%)'})

          for(let i in taskData.varieties){
            let variety=taskData.varieties[i];
            if((variety['status']!='Active') && !incentive_varieties[variety['id']])
              continue;
            if(variety['whose']!='ARM')
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
            rows[variety['id']]['type_name']=variety['crop_type_name'];
            rows[variety['id']]['variety_name']=variety['name'];
            rows[variety['id']]['quantity_sales']=0;
            rows[variety['id']]['amount_sales']=0;
            rows[variety['id']]['unit_price']=0;
            rows[variety['id']]['unit_price_net']=0;

            rows[variety['id']]['quantity_target']=0;

            for(let i in incentive_slabs){
              rows[variety['id']]['quantity_achievable_'+incentive_slabs[i].id]=0;
              rows[variety['id']]['amount_achievable_'+incentive_slabs[i].id]=0;
            }

            rows[variety['id']]['quantity_difference']=0;
            rows[variety['id']]['achievement']=0;
            rows[variety['id']]['quantity_incentive']=0;
            rows[variety['id']]['amount_incentive']=0;

            rows_array.push(rows[variety['id']])
          }
          for(let i in res.data.sales){
            let datum=res.data.sales[i];
            if(rows[datum['variety_id']]){
              rows[datum['variety_id']]['quantity_sales']=datum['quantity']
              rows[datum['variety_id']]['amount_sales']=datum['amount']
              if(datum['quantity']>0){
                rows[datum['variety_id']]['unit_price']=rows[datum['variety_id']]['amount_sales']/rows[datum['variety_id']]['quantity_sales'];
                rows[datum['variety_id']]['unit_price_net']=(rows[datum['variety_id']]['unit_price']-(rows[datum['variety_id']]['unit_price']*net_sale_adjustment/100))
              }
            }
          }
          for(let variety_id in res.data.target){
            if(rows[variety_id]){
              rows[variety_id]['quantity_target']=(+res.data.target[variety_id])
            }
          }

          let row_total={}
          row_total['id']=0;
          row_total['num_rows']=1;
          row_total['crop_name']='Total';
          row_total['type_name']='';
          row_total['variety_name']='';
          row_total['quantity_sales']=0;
          row_total['amount_sales']=0;
          row_total['unit_price']=0;
          row_total['unit_price_net']=0;

          row_total['quantity_target']=0;

          for(let i in incentive_slabs){
            row_total['quantity_achievable_'+incentive_slabs[i].id]=0;
            row_total['amount_achievable_'+incentive_slabs[i].id]=0;
          }

          row_total['quantity_difference']=0;
          row_total['achievement']=0;
          row_total['quantity_incentive']=0;
          row_total['amount_incentive']=0;



          for(let i in rows_array){
            let row=rows[rows_array[i]['id']];
            row['quantity_difference']=row['quantity_target']-row['quantity_sales']
            if(row['quantity_target']>0){
              row['achievement']=(row['quantity_sales']*100/row['quantity_target']);
              for(let j in incentive_slabs){
                let slab=incentive_slabs[j];
                row['quantity_achievable_'+slab.id]=row['quantity_target']*(+slab.name)/100
                if(incentive_varieties[row['id']]){
                  if(incentive_varieties[row['id']]['incentive'][slab.id]){
                    let amount_achievable=(row['quantity_achievable_'+slab.id]*row['unit_price_net']*(+incentive_varieties[row['id']]['incentive'][slab.id])*manager_incentive/10000);
                    row['amount_achievable_'+slab.id]=amount_achievable;
                    row_total['amount_achievable_'+slab.id]+=amount_achievable;
                  }
                }
              }
            }
            else if(row['quantity_sales']>0){
              row['achievement']=100;
            }

            if(row['achievement']>0){
              for(let j in incentive_slabs){
                let slab=incentive_slabs[j];
                if(row['achievement']>=(+slab.name)){
                  row['quantity_incentive']=row['quantity_sales']
                  if(incentive_varieties[row['id']]){
                    if(incentive_varieties[row['id']]['incentive'][slab.id]){
                      let amount_incentive=(row['quantity_incentive']*row['unit_price_net']*(+incentive_varieties[row['id']]['incentive'][slab.id])*manager_incentive/10000);
                      row['amount_incentive']=amount_incentive;
                      row_total['amount_incentive']+=amount_incentive;
                    }
                  }
                  break;
                }
              }
            }
            rows_array[i]=row;
          }
          rows_array.unshift(row_total)
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
      let width=0;
      for(let index in taskData.columns.all){
        if(taskData.columns.hidden.indexOf(taskData.columns.all[index].group)<0){
          width+=150;
        }
      }
      table_width.value=width;
    }
    setInputFields();
    $(document).ready(async function()
    {
      taskData.columns.selectable=['quantity_sales','amount_sales','unit_price','unit_price_net','quantity_target','quantity_achievable','amount_achievable','quantity_difference','achievement','quantity_incentive','amount_incentive'];
      taskData.columns.hidden=['amount_sales','unit_price','unit_price_net','quantity_achievable','amount_achievable','quantity_incentive'];

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
        item.inputFields3[key].options=taskData.varieties.filter((temp)=>{ if((temp.crop_type_id==crop_type_id) && (temp.whose=='ARM') && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })



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

      })
      $(document).off("change", "#area_id");
      $(document).on("change",'#area_id',async function()
      {
        let area_id=$(this).val();
        let key='territory_id';
        item.inputFields2[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');

      })


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