import json
import struct
import sys

def parse_glb(file_path):
    with open(file_path, 'rb') as f:
        # Read header
        magic = f.read(4)
        if magic != b'glTF':
            print("Not a valid GLB file")
            return

        version = struct.unpack('<I', f.read(4))[0]
        length = struct.unpack('<I', f.read(4))[0]

        # Read chunks
        while f.tell() < length:
            chunk_length = struct.unpack('<I', f.read(4))[0]
            chunk_type = f.read(4)
            
            if chunk_type == b'JSON':
                json_data = f.read(chunk_length)
                data = json.loads(json_data)
                
                if 'meshes' in data:
                    print("Meshes found:")
                    for i, mesh in enumerate(data['meshes']):
                        print(f"Index {i}: {mesh.get('name', 'Unnamed')}")
                        if 'primitives' in mesh:
                            for prim in mesh['primitives']:
                                if 'material' in prim:
                                    print(f"  - Material Index: {prim['material']}")
                else:
                    print("No meshes found in JSON chunk")
                return
            else:
                f.seek(chunk_length, 1) # Skip other chunks

if __name__ == "__main__":
    parse_glb('public/cassette_new.glb')
