<template>
  <div class="row mb-2" v-if="!inputItem.more_values">
    <div class="col-4">
      <label class="font-weight-bold float-right">{{inputItem.label}} <span class="text-danger" v-if="inputItem.mandatory">*</span></label>
    </div>
    <div class="col-lg-4 col-8">
      <div class="row mb-2">
        <div class="col-12">
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <label class="btn btn-sm bg-gradient-primary" style="cursor: pointer;">
                <input :id="inputKey" type="file" class="d-none" :data-preview-container="'#'+inputKey+'_preview_container'">
                <i class="bi bi-upload"></i> {{labels.get('label_upload_file')}}
              </label>
            </div>
            <label class="form-control custom-file-name"></label>
            <div class="input-group-append clear_file" @click="resetFile(inputKey,inputItem.default)">
              <label class="btn btn-sm bg-gradient-info" style="cursor: pointer;">clear</label>
            </div>
            <input :id="inputKey+'_file_input'" type="hidden" :name="inputItem.name" :value="inputItem.default" />
          </div>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-12 system_preview_container" :id="inputKey+'_preview_container'">
          <img style="max-width: 100%;max-height:200px" :src="systemFunctions.getImageUrl(inputItem.default)">
        </div>
      </div>
    </div>
  </div>
  <div class="row mb-2" :id="inputKey+'_system_add_more_input_container'" v-else>
    <div class="col-4">
      <label class="font-weight-bold float-right">{{inputItem.label}} <span class="text-danger" v-if="inputItem.mandatory">*</span></label>
    </div>
    <div class="col-lg-4 col-8">
      <div class="row mb-2">
        <div class="col-12">
          <button type="button" class="system_add_more_button mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="addMore(inputItem.default)"><i class="bi bi-plus-circle"></i> {{labels.get('label_add_more')}}</button>
        </div>
      </div>
    </div>
    <div class="system_add_more_content d-none">
      <div class="row mb-2 system_file_add_more_holder">
        <div class="col-12">
          <div class="row mb-2">
            <div class="col-12">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <label class="btn btn-sm bg-gradient-primary" style="cursor: pointer;">
                    <input type="file" class="d-none">
                    <i class="bi bi-upload"></i> {{labels.get('label_upload_file')}}
                  </label>
                </div>
                <label class="form-control custom-file-name"></label>
                <div class="input-group-append system_clear_file">
                  <label class="btn btn-sm bg-gradient-info" style="cursor: pointer;">clear</label>
                </div>
                <div class="input-group-append system_remove_more_button" style="cursor: pointer">
                  <label class="btn btn-sm bg-gradient-danger" style="cursor: pointer;"><i class="bi bi-dash-circle"></i></label>
                </div>
                <input type="hidden" :value="inputItem.default" />
              </div>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-12 system_preview_container">
              <img style="max-width: 100%;max-height:200px" :src="systemFunctions.getImageUrl(inputItem.default)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
    import systemFunctions from "@/assets/systemFunctions";
    import { onMounted } from 'vue'
    import labels from '@/labels'

    const props=defineProps({
        inputItem: {
            type: Object,
            required: true
        },
        inputKey: {
          type: String,
          required: true
        },
    })
    let current_add_more_index=0;
    onMounted(() => {
      if(props.inputItem.more_values){
        for(let i=0;i<props.inputItem.more_values.length;i++){
          addMore(props.inputItem.more_values[i]);
        }
      }
    })
    const addMore=(defaultUrl)=>{
      let curIndex=current_add_more_index;
      let html=$("#"+props.inputKey+'_system_add_more_input_container .system_add_more_content > div').clone();
      html.find('.system_default_file').html(defaultUrl);
      html.find('img').attr('src',systemFunctions.getImageUrl(defaultUrl));
      html.find('input[type=file]').attr('id',props.inputKey+'_'+curIndex);
      html.find('input[type=file]').attr('data-preview-container','#'+props.inputKey+'_'+curIndex+'_preview_container');
      html.find('input[type=hidden]').attr('id',props.inputKey+'_'+curIndex+'_file_input');
      html.find('input[type=hidden]').attr('name',props.inputItem.name+'[]')
      html.find('input[type=hidden]').val(defaultUrl)

      html.find('.system_preview_container').attr('id',props.inputKey+'_'+curIndex+'_preview_container');

      html.find('.system_remove_more_button').on('click',(event)=>{
        removeMore(event)
      })
      html.find('.system_clear_file').on('click',(event)=>{
        resetFile(props.inputKey+'_'+curIndex,defaultUrl)
      })
      $("#"+props.inputKey+'_system_add_more_input_container .system_add_more_button').parent().parent().before(html);

      current_add_more_index++;
    }
    const resetFile=(fileId,defaultUrl)=>{
      $('#'+fileId).val('').trigger('change');
      $('#'+fileId+'_preview_container img').attr('src',systemFunctions.getImageUrl(defaultUrl));
    }
    const removeMore=(event)=>{
      $(event.target).closest('.system_file_add_more_holder').remove();
    }
</script>


