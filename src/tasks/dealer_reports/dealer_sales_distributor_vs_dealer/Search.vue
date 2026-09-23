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
        <div class="card-body">
          <div class="row">
            <template v-for="column in taskData.columns.selectable1">
              <div class="col-sm-4 col-md-2">
                <label><input :class="'column_control '+column" type="checkbox" :value="column" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
              </div>
            </template>
          </div>
          <div class="row">
            <template v-for="column in taskData.columns.selectable2">
              <div class="col-sm-4 col-md-2">
                <label><input :class="'column_control '+column" type="checkbox" :value="column" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
              </div>
            </template>
          </div>
          <div class="row">
            <template v-for="column in taskData.columns.selectable3">
              <div class="col-sm-4 col-md-2">
                <label><input :class="'column_control '+column" type="checkbox" :value="column" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
              </div>
            </template>
          </div>
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
        <tr v-for="row in taskData.itemsFiltered">
          <template v-for="(column,index) in taskData.columns.all">

            <td :class="((['part_name','area_name','territory_name','distributor_name','crop_name','crop_type_name'].indexOf(column.group) == -1)?'text-right':'')+(column.class?(' '+column.class):' col_9')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
              <template v-if="(['crop_type_name'].indexOf(column.key) != -1)">
                <div v-html="row[column.key]"></div>
              </template>
              <template v-else-if="(['distributor_quantity_sales_gross','distributor_quantity_sales_cancel','distributor_quantity_sales_net',
              'dealer_quantity_sales_gross','distributor_quantity_sales_cancel','dealer_quantity_sales_net','quantity_difference_net'].indexOf(column.key) != -1)">
                {{ row[column.key]?row[column.key].toFixed(3):'' }}
              </template>
              <template v-else-if="(['achievement'].indexOf(column.key) != -1)">
                {{ row[column.key]?row[column.key].toFixed(2)+'%':'' }}
              </template>
              <template  v-else>{{row[column.key]}}</template>

            </td>
          </template>

        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'
    import {inject, nextTick, reactive, ref} from 'vue'
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
    let dealers_object={};
    for(let i in taskData.dealers){
      let dealer_id=taskData.dealers[i]['id'];
      dealers_object[dealer_id]=taskData.dealers[i];
    }

    const setInputFields=async ()=>{
      item.inputFields1= {};
      item.inputFields2= {};
      item.inputFields3= {};
      await systemFunctions.delay(1);
      let inputFields={}
      // let key='report_format';
      // inputFields[key] = {
      //   name: 'options[' +key +']',
      //   label: labels.get('label_'+key),
      //   type:'dropdown',
      //   options:[
      //       {value:'crop',label:'Crop Wise'},{value:'type',label:'Type Wise'},{value:'variety',label:'Variety Wise'},
      //     {value:'crop_arm_location',label:'Malik Zoning (Crop)'},{value:'type_arm_location',label:'Malik Zoning (Type)'},{value:'variety_arm_location',label:'Malik Zoning (Variety)'},
      //   ],
      //   default:'variety',
      //   mandatory:true,
      //   noselect:true,
      // };
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
      key='sales_from';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'date',
        default:item.data[key],
        mandatory:true
      };
      key='sales_to';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'date',
        default:item.data[key],
        mandatory:true
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
      key='dealer_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:'',
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
      item.inputFields3=inputFields;
      item.exists=true;
      await nextTick()
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

          let rows_array=[];
          for(let i in res.data.items){
            let item=res.data.items[i];
            for(let bonus_id in item['sales_by_bonus_group']){
              let sales_datum=item['sales_by_bonus_group'][bonus_id]
              let row={}
              row['part_name']=item['part_name'];
              row['area_name']=item['area_name'];
              row['territory_name']=item['territory_name'];
              row['distributor_name']=item['distributor_name'];
              row['crop_name']=(taskData.bonus_setup[bonus_id]?taskData.bonus_setup[bonus_id]['crop_name']:bonus_id);
              //row['crop_name']=bonus_id;
              row['crop_type_name']=(taskData.bonus_setup[bonus_id]?taskData.bonus_setup[bonus_id]['crop_type_name']:bonus_id);
              row['distributor_quantity_sales_gross']=sales_datum['distributor_quantity_sales_gross'];
              row['distributor_quantity_sales_cancel']=sales_datum['distributor_quantity_sales_cancel'];
              row['distributor_quantity_sales_net']=sales_datum['distributor_quantity_sales_gross']-sales_datum['distributor_quantity_sales_cancel'];
              row['dealer_quantity_sales_gross']=sales_datum['dealer_quantity_sales_gross'];
              row['dealer_quantity_sales_cancel']=sales_datum['dealer_quantity_sales_cancel'];
              row['dealer_quantity_sales_net']=sales_datum['dealer_quantity_sales_gross']-sales_datum['dealer_quantity_sales_cancel'];

              row['quantity_difference_net']=row['distributor_quantity_sales_net']-row['dealer_quantity_sales_net'];
              row['achievement']=0;
              if(row['distributor_quantity_sales_net']>0)
              {
                row['achievement']=(row['dealer_quantity_sales_net']*100/row['distributor_quantity_sales_net'])
              }
              rows_array.push(row)
            }
          }
          taskData.itemsFiltered=rows_array;
          show_report.value=true;
          console.log(rows_array)
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      })
    }
    const exportCsv=async ()=>{
      systemFunctions.exportCsvFromHtmlTable('#table_report',labels.get('label_task'))
    }
    const showHtmlContentInNewWindow=async ()=>{
      systemFunctions.showHtmlContentInNewWindow('<table>'+$('#table_report').html()+'</table>',labels.get('label_task'))
    }
    const toggleReportControlColumns=(event)=>{
      //show_report.value=false;
      let hiddenColumns=[]
      for(let i in taskData.columns.selectable1){
        let column=taskData.columns.selectable1[i];
        let checked=$('.column_control.'+column).is(':checked');
        if(!checked){
          hiddenColumns.push(column)
        }
      }
      for(let i in taskData.columns.selectable2){
        let column=taskData.columns.selectable2[i];
        let checked=$('.column_control.'+column).is(':checked');
        if(!checked){
          hiddenColumns.push(column)
        }
      }
      for(let i in taskData.columns.selectable3){
        let column=taskData.columns.selectable3[i];
        let checked=$('.column_control.'+column).is(':checked');
        if(!checked){
          hiddenColumns.push(column)
        }
      }
      taskData.columns.hidden=hiddenColumns
      calculateTableWidth();
    }

    const calculateTableWidth=()=>{
      table_width.value=systemFunctions.calculateReportTableWidth(taskData.columns);
    }
    setInputFields();
    $(document).ready(async function()
    {
      let columns_all=[];
      columns_all.push({'group':'part_name','key':'part_name','label':labels.get('label_part_name')})
      columns_all.push({'group':'area_name','key':'area_name','label':labels.get('label_area_name')})
      columns_all.push({'group':'territory_name','key':'territory_name','label':labels.get('label_territory_name')})
      columns_all.push({'group':'distributor_name','key':'distributor_name','label':labels.get('label_distributor_name')})

      columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
      columns_all.push({'group':'crop_type_name','key':'crop_type_name','label':labels.get('label_crop_type_name')})

      columns_all.push({'group':'quantity_sales_gross','key':'distributor_quantity_sales_gross','label':'(Gross sales)'})
      columns_all.push({'group':'quantity_sales_cancel','key':'distributor_quantity_sales_cancel','label':'(Canceled sales)'})
      columns_all.push({'group':'quantity_sales_net','key':'distributor_quantity_sales_net','label':'(Net sales)'})

      columns_all.push({'group':'quantity_sales_gross','key':'dealer_quantity_sales_gross','label':'(Gross sales Dealer)'})
      columns_all.push({'group':'quantity_sales_cancel','key':'dealer_quantity_sales_cancel','label':'(Canceled sales Dealer)'})
      columns_all.push({'group':'quantity_sales_net','key':'dealer_quantity_sales_net','label':'(Net sales Dealer)'})

      columns_all.push({'group':'quantity_difference','key':'quantity_difference_net','label':labels.get('label_quantity')+'</br>(Difference)'})
      columns_all.push({'group':'achievement','key':'achievement','label':labels.get('label_achievement')})

      taskData.columns.all=columns_all;
      calculateTableWidth();

      taskData.columns.selectable1=['part_name','area_name','territory_name','distributor_name','crop_name','crop_type_name'];
      taskData.columns.selectable2=['quantity_sales_gross','quantity_sales_cancel','quantity_sales_net'];
      taskData.columns.selectable3=['quantity_difference','achievement'];
      taskData.columns.hidden=[];
      await systemFunctions.delay(20);
      //$('.column_control').prop('checked',true)
      $('.column_control.part_name').prop('checked',true)
      $('.column_control.area_name').prop('checked',true)
      $('.column_control.territory_name').prop('checked',true)
      $('.column_control.distributor_name').prop('checked',true)
      $('.column_control.crop_name').prop('checked',true)
      $('.column_control.crop_type_name').prop('checked',true)
      $('.column_control.quantity_sales_net').prop('checked',true)
      $('.column_control.quantity_difference').prop('checked',true)
      $('.column_control.achievement').prop('checked',true)
      toggleReportControlColumns();

      $(document).off("change", "#report_format");


      $(document).off("change", "#fiscal_year");
      $(document).on("change",'#fiscal_year',async function()
      {
        let fiscal_year=$(this).val();
        if(fiscal_year>0){
          let start_date_temp=moment(fiscal_year+'-'+globalVariables.fiscal_year_starting_month+'-01','YYYY-MM-DD');
          let end_date=start_date_temp.clone().add(1,'year').add(-1,'day')
          let start_date=start_date_temp.clone()
          if($("#num_fiscal_years").val()>1){
            start_date=start_date_temp.clone().add(($("#num_fiscal_years").val()*-1+1),'year')
          }

          $("#sales_from").val(start_date.format('YYYY-MM-DD'))
          $("#sales_to").val(end_date.format('YYYY-MM-DD'))
        }
        else{
          $("#sales_from").val(moment().startOf('month').format('YYYY-MM-DD'))
          $("#sales_to").val(moment().endOf('month').format('YYYY-MM-DD'))
        }
      });
      await systemFunctions.delay(20);
      $('#fiscal_year').trigger('change')

      $(document).off("change", "#crop_id");

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
        key='dealer_id';
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
        key='dealer_id';
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
        key='dealer_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#distributor_id");
      $(document).on("change",'#distributor_id',async function()
      {
        let distributor_id=$(this).val();
        let key='dealer_id';
        item.inputFields2[key].options=taskData.dealers.filter((temp)=>{ if((temp.distributor_id==distributor_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
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